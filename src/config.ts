/**
 * Configuration for the explainer video
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};

export const VIDEO = {
  slug: 'explainer',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {
    big: 'AI STUDIO',
    rest: '',
    en: 'Autonomous Video & Audio Pipeline',
    tagline: 'Code-Driven Motion Graphics & Narrated Explainers'
  },
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: 'built by Antigravity Studio',
  chapterTech: ['Architecture', 'Synthesis'],
  hud: [
    {fromS: 'S01', toS: 'S01', text: 'Pipeline Intro'},
    {fromS: 'S02', toS: 'S02', text: 'Audio & Motion Sync', tech: 'TTS & Remotion'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 30,
};
