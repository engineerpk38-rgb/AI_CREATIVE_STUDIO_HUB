import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {FONT_HEAVY, FONT_TECH, FONT_MONO, clamp01} from '../../common';
import {PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_LINE, GLOW_PURPLE, fadeIn, scaleIn} from '../../ui';

const Shot1Comp: React.FC = () => {
  const frame = useCurrentFrame();
  const N = frame + 86; // frames 86 to 438

  // Animation timing
  const titleOp = fadeIn(frame - 5, 15);
  const cardScale = scaleIn(frame - 15, 20);
  const flowProgress = clamp01((frame - 35) / 60);

  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {/* Glow Backdrop */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 300,
          background: 'radial-gradient(circle, rgba(102,48,248,0.2) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          opacity: titleOp,
        }}
      />

      {/* Main Title Badge */}
      <div
        style={{
          opacity: titleOp,
          transform: `scale(${cardScale})`,
          border: `2px solid ${PURPLE}`,
          background: 'rgba(15, 10, 30, 0.85)',
          boxShadow: GLOW_PURPLE,
          borderRadius: 16,
          padding: '24px 48px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{fontFamily: FONT_HEAVY, fontSize: 44, color: WHITE, letterSpacing: 2}}>
          AI VIDEO STUDIO
        </div>
        <div style={{fontFamily: FONT_TECH, fontSize: 18, color: PURPLE_LIGHT, marginTop: 8}}>
          CODE-DRIVEN MOTION & EXPLAINERS
        </div>
      </div>

      {/* Connected Architecture Flow */}
      <div style={{display: 'flex', gap: 40, marginTop: 48, alignItems: 'center', opacity: titleOp}}>
        {[
          {step: '01', title: 'SCRIPT & STORY', desc: 'Markdown & Agents'},
          {step: '02', title: 'AUDIO & TTS', desc: '48kHz Timestamps'},
          {step: '03', title: 'MOTION GRAPHICS', desc: 'Remotion / React'},
        ].map((node, i) => (
          <div
            key={i}
            style={{
              width: 220,
              padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              background: 'rgba(20,20,25,0.7)',
              textAlign: 'center',
            }}
          >
            <div style={{fontFamily: FONT_MONO, fontSize: 14, color: PURPLE_LIGHT, marginBottom: 4}}>{node.step}</div>
            <div style={{fontFamily: FONT_HEAVY, fontSize: 16, color: WHITE}}>{node.title}</div>
            <div style={{fontFamily: FONT_TECH, fontSize: 12, color: GREY, marginTop: 4}}>{node.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SHOTS_G1: ShotDef[] = [
  {id: 'S01_Scene', from: 86, to: 438, Comp: Shot1Comp},
];

export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
