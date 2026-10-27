<#
.SYNOPSIS
  AI Video & Audio Studio CLI Runner
.EXAMPLE
  .\run.ps1 voice     # Synthesize voiceover and build subtitle timeline
  .\run.ps1 studio    # Launch interactive Remotion Studio web preview
  .\run.ps1 render    # Render full MP4 video
  .\run.ps1 preview   # Render short 60-frame preview
#>

param (
    [Parameter(Position=0)]
    [ValidateSet('voice', 'studio', 'render', 'preview', 'typecheck')]
    [string]$Action = 'render'
)

$StudioDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $StudioDir

$env:PYTHONUTF8 = "1"
$env:TTS_ENGINE = "edge"
$env:VOICE = "en-US-ChristopherNeural"

switch ($Action) {
    'voice' {
        Write-Host ">>> Generating Voiceover and Aligning Subtitle Timelines..." -ForegroundColor Cyan
        python scripts/tts_build.py
        Write-Host ">>> Audio and Subtitles Ready in public/assets/explainer/audio.wav and src/common/timeline.ts" -ForegroundColor Green
    }
    'studio' {
        Write-Host ">>> Launching Remotion Studio Web Preview at http://localhost:3000 ..." -ForegroundColor Cyan
        npx remotion studio src/index.ts
    }
    'render' {
        Write-Host ">>> Rendering Full MP4 Video..." -ForegroundColor Cyan
        npx remotion render src/index.ts Video renders/explainer.mp4
        Write-Host ">>> Video Rendered: $StudioDir\renders\explainer.mp4" -ForegroundColor Green
    }
    'preview' {
        Write-Host ">>> Rendering Fast 60-Frame Preview..." -ForegroundColor Cyan
        npx remotion render src/index.ts Video renders/preview.mp4 --frames=0-60
        Write-Host ">>> Preview Rendered: $StudioDir\renders\preview.mp4" -ForegroundColor Green
    }
    'typecheck' {
        Write-Host ">>> Checking TypeScript Code..." -ForegroundColor Cyan
        npm run typecheck
    }
}
