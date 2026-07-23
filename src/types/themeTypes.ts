export type Theme =
  | 'modern-os'
  | 'orange-ember'
  | 'vintage-terminal'
  | 'cyberpunk-neon'
  | 'amber-retro'
  | 'ice-blue'
  | 'blood-moon'
  | 'synthwave-purple'
  | 'teal-ocean'
  | 'rose-quartz';

export const themes: Theme[] = [
  'modern-os',
  'orange-ember',
  'vintage-terminal',
  'cyberpunk-neon',
  'amber-retro',
  'ice-blue',
  'blood-moon',
  'synthwave-purple',
  'teal-ocean',
  'rose-quartz',
] as const;

export type ThemeProperty =
  | '--background-color'
  | '--text-color'
  | '--text-secondary-color'
  | '--accent-color'
  | '--svg-color'
  | '--button-primary-color'
  | '--button-secondary-color'
  | '--button-hover-color'
  | '--button-text-color'
  | '--input-primary-color'
  | '--input-secondary-color'
  | '--input-border-color'
  | '--input-focus-color'
  | '--taskbar-background-color'
  | '--taskbar-border-color'
  | '--window-primary-color'
  | '--window-secondary-color'
  | '--window-border-color'
  | '--highlight-color'
  | '--tabs-background'
  | '--tabs-secondary-background'
  | '--tabs-text'
  | '--tabs-hover';
