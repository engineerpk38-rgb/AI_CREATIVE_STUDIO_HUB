import http from 'node:http';
import {spawn} from 'node:child_process';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.STUDIO_PORT || 4173);
const MAX_BODY = 128 * 1024;
const LOG_LIMIT = 250;
const ALLOWED_ACTIONS = new Set(['voice', 'preview', 'render']);
const ALLOWED_VOICES = new Set([
  'en-US-ChristopherNeural',
  'en-US-JennyNeural',
  'zh-CN-YunxiNeural',
]);
const state = {running: false, action: null, startedAt: null, finishedAt: null, exitCode: null, logs: []};
let activeChild = null;

if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) {
  console.error('STUDIO_PORT must be a port number between 1024 and 65535.');
  process.exit(1);
}

const paths = {
  script: path.join(ROOT, 'script', 'narration.txt'),
  audio: path.join(ROOT, 'public', 'assets', 'explainer', 'audio.wav'),
  timeline: path.join(ROOT, 'script', 'timeline.json'),
  preview: path.join(ROOT, 'renders', 'preview.mp4'),
  render: path.join(ROOT, 'renders', 'explainer.mp4'),
};

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers});
  res.end(JSON.stringify(data));
}

function appendLog(text) {
  for (const line of String(text).split(/\r?\n/).filter(Boolean)) {
    state.logs.push({at: new Date().toISOString(), text: line});
  }
  if (state.logs.length > LOG_LIMIT) state.logs.splice(0, state.logs.length - LOG_LIMIT);
}

function isLocalRequest(req) {
  const host = req.headers.host || '';
  if (!new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]).has(host)) return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'http:' && parsed.host === host;
  } catch { return false; }
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY) throw new Error('Request body is too large.');
  }
  try { return JSON.parse(body || '{}'); } catch { throw new Error('Request body must be valid JSON.'); }
}

async function getStatus() {
  let script = '';
  try { script = await fs.readFile(paths.script, 'utf8'); } catch {}
  return {
    script,
    files: {
      audio: await exists(paths.audio), timeline: await exists(paths.timeline),
      preview: await exists(paths.preview), render: await exists(paths.render),
      dependencies: await exists(path.join(ROOT, 'node_modules')),
    },
    job: {running: state.running, action: state.action, startedAt: state.startedAt,
      finishedAt: state.finishedAt, exitCode: state.exitCode},
    logs: state.logs,
  };
}

function launch(action, voice) {
  const isWindows = process.platform === 'win32';
  const executable = isWindows ? 'powershell.exe' : 'pwsh';
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'run.ps1'), action];
  const child = spawn(executable, args, {
    cwd: ROOT,
    env: {...process.env, PYTHONUTF8: '1', TTS_ENGINE: 'edge', VOICE: voice},
    windowsHide: true,
    shell: false,
  });
  activeChild = child;
  state.running = true;
  state.action = action;
  state.startedAt = new Date().toISOString();
  state.finishedAt = null;
  state.exitCode = null;
  state.logs = [];
  appendLog(`Starting ${action} with ${voice}...`);
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', appendLog);
  child.stderr.on('data', (chunk) => appendLog(`[stderr] ${chunk}`));
  child.on('error', (error) => {
    appendLog(`Could not start PowerShell: ${error.message}`);
    state.running = false;
    state.finishedAt = new Date().toISOString();
    state.exitCode = 1;
    activeChild = null;
  });
  child.on('close', (code) => {
    if (activeChild !== child) return;
    state.running = false;
    state.finishedAt = new Date().toISOString();
    state.exitCode = code ?? 1;
    appendLog(code === 0 ? 'Workflow completed successfully.' : `Workflow failed (exit code ${code ?? 'unknown'}).`);
    activeChild = null;
  });
}

function serveVideo(req, res, file) {
  fs.stat(file).then((stat) => {
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) { res.writeHead(416); return res.end(); }
      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : stat.size - 1;
      if (!match[1] && match[2]) start = Math.max(0, stat.size - Number(match[2]));
      end = Math.min(end, stat.size - 1);
      if (start > end || start >= stat.size) { res.writeHead(416, {'Content-Range': `bytes */${stat.size}`}); return res.end(); }
      res.writeHead(206, {'Content-Type': 'video/mp4', 'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store'});
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file, {start, end}).pipe(res);
      return;
    }
    res.writeHead(200, {'Content-Type': 'video/mp4', 'Content-Length': stat.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store'});
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  }).catch(() => send(res, 404, {error: 'Video not found yet. Render a preview or final video first.'}));
}

const server = http.createServer(async (req, res) => {
  if (!isLocalRequest(req)) return send(res, 403, {error: 'Only requests from this local studio are allowed.'});
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  try {
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/') {
      res.writeHead(302, {Location: '/studio.html', 'Cache-Control': 'no-store'});
      return res.end();
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/studio.html') {
      const html = await fs.readFile(path.join(ROOT, 'studio.html'));
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
      return req.method === 'HEAD' ? res.end() : res.end(html);
    }
    if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, await getStatus());
    if (req.method === 'GET' && url.pathname === '/api/script') {
      return send(res, 200, {script: await fs.readFile(paths.script, 'utf8')});
    }
    if (req.method === 'PUT' && url.pathname === '/api/script') {
      const body = await readJson(req);
      if (typeof body.script !== 'string' || Buffer.byteLength(body.script) > MAX_BODY) {
        return send(res, 400, {error: 'Narration must be text no larger than 128 KB.'});
      }
      await fs.mkdir(path.dirname(paths.script), {recursive: true});
      await fs.writeFile(paths.script, body.script, 'utf8');
      appendLog('Narration script saved.');
      return send(res, 200, {ok: true});
    }
    if (req.method === 'POST' && url.pathname === '/api/run') {
      if (state.running) return send(res, 409, {error: 'A workflow is already running.'});
      const body = await readJson(req);
      if (!ALLOWED_ACTIONS.has(body.action)) return send(res, 400, {error: 'Choose voice, preview, or render.'});
      const voice = ALLOWED_VOICES.has(body.voice) ? body.voice : 'en-US-ChristopherNeural';
      if (body.action !== 'voice' && !(await exists(paths.audio))) {
        return send(res, 409, {error: 'Generate the voiceover first so Remotion has its audio asset.'});
      }
      if (!(await exists(path.join(ROOT, 'node_modules')))) {
        return send(res, 409, {error: 'Dependencies are missing. Run npm install in the project folder first.'});
      }
      launch(body.action, voice);
      return send(res, 202, {ok: true, action: body.action});
    }
    const video = url.pathname === '/renders/preview.mp4' ? paths.preview
      : url.pathname === '/renders/explainer.mp4' ? paths.render : null;
    if (video && (req.method === 'GET' || req.method === 'HEAD')) return serveVideo(req, res, video);
    return send(res, 404, {error: 'Not found.'});
  } catch (error) {
    return send(res, 500, {error: error.message || 'Unexpected local server error.'});
  }
});

server.on('clientError', (_error, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));
server.listen(PORT, '127.0.0.1', () => {
  console.log(`AI Creative Studio is ready: http://127.0.0.1:${PORT}`);
  console.log('Keep this terminal open while using the local studio. Press Ctrl+C to stop it.');
});
