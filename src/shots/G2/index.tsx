import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {FONT_HEAVY, FONT_TECH, FONT_MONO, clamp01} from '../../common';
import {PURPLE, PURPLE_LIGHT, WHITE, GREY, GLOW_PURPLE, fadeIn, scaleIn} from '../../ui';

const Shot2Comp: React.FC = () => {
  const frame = useCurrentFrame();
  const N = frame + 439; // frames 439 to 880

  const op = fadeIn(frame - 5, 15);
  const scale = scaleIn(frame - 10, 20);

  // Simulated audio waveform heights
  const bars = [18, 35, 60, 42, 85, 95, 70, 48, 88, 110, 65, 40, 75, 90, 50, 30, 60, 45, 20];

  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {/* Title */}
      <div style={{opacity: op, transform: `scale(${scale})`, textAlign: 'center', marginBottom: 32}}>
        <div style={{fontFamily: FONT_HEAVY, fontSize: 38, color: WHITE}}>
          AUDIO & TIMELINE SYNCHRONIZATION
        </div>
        <div style={{fontFamily: FONT_TECH, fontSize: 16, color: PURPLE_LIGHT, marginTop: 6}}>
          FRAME-PERFECT SUBTITLES & AUDIO WAVEFORMS
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div
        style={{
          opacity: op,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 140,
          padding: '0 32px',
          background: 'rgba(12, 10, 24, 0.8)',
          borderRadius: 16,
          border: `1px solid rgba(102,48,248,0.4)`,
          boxShadow: GLOW_PURPLE,
        }}
      >
        {bars.map((h, i) => {
          // Dynamic pulsing
          const pulse = Math.sin((frame * 0.2) + i * 0.5) * 15;
          const currentH = Math.max(10, h + pulse);
          return (
            <div
              key={i}
              style={{
                width: 12,
                height: currentH,
                backgroundColor: i % 2 === 0 ? PURPLE : PURPLE_LIGHT,
                borderRadius: 6,
                transition: 'height 0.05s ease',
              }}
            />
          );
        })}
      </div>

      {/* Meta Specs */}
      <div style={{display: 'flex', gap: 32, marginTop: 28, opacity: op}}>
        <div style={{fontFamily: FONT_MONO, fontSize: 14, color: GREY}}>AUDIO: <span style={{color: WHITE}}>48 kHz 16-bit</span></div>
        <div style={{fontFamily: FONT_MONO, fontSize: 14, color: GREY}}>FRAME RATE: <span style={{color: WHITE}}>30 FPS</span></div>
        <div style={{fontFamily: FONT_MONO, fontSize: 14, color: GREY}}>RESOLUTION: <span style={{color: PURPLE_LIGHT}}>1280 × 720 (4K Ready)</span></div>
      </div>
    </div>
  );
};

export const SHOTS_G2: ShotDef[] = [
  {id: 'S02_Scene', from: 439, to: 880, Comp: Shot2Comp},
];

export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
