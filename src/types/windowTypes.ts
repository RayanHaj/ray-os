export interface WindowReference {
  id: number;
  minimized: boolean;
}
export interface WindowFlatReference {
  id: number;
  label: string;
  minimized: boolean;
}
export type WindowStyleObject = {
  left: string;
  top: string;
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  zIndex: number;
  display: string;
  cursor: string;
  transition: string;
};

export const windowNames = [
  'settings',
  'calculator',
  'fileExplorer',
  'terminal',
  'notepad',
  'imageViewer',
  'videoPlayer',
  'audioPlayer',
  'properties',
  'snake',
] as const;
export type WindowName = (typeof windowNames)[number];
export type WindowType = 'inline' | 'fixed';
