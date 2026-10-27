// 自动生成：scripts/tts_build.py。帧号 1 起含端点。
export const TOTAL_FRAMES = 890;
export const CHAPTER_STARTS: Array<{n: number; title: string; from: number}> = [
  {n: 1, title: "Pipeline Overview", from: 86},
  {n: 2, title: "Audio and Motion Sync", from: 439},
];
export type Sentence = {id: string; chapter: number; from: number; to: number; text: string};
export const SENTENCES: Sentence[] = [
  {id: "S01", chapter: 1, from: 86, to: 236, text: "Welcome to the autonomous AI video studio, where code and narration come together."},
  {id: "S02", chapter: 1, from: 247, to: 383, text: "Every graphic is rendered programmatically, synchronized with crystal-clear audio."},
  {id: "S03", chapter: 2, from: 439, to: 618, text: "Text-to-speech voiceovers generate precise timestamps, aligning subtitles down to the exact frame."},
  {id: "S04", chapter: 2, from: 629, to: 790, text: "From concept to finished MP4 video, the entire workflow runs completely in code."},
];
