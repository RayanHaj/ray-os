import type { Application } from '@/types/itemTypes.ts';

const defineMinWidths: Record<Application | string, { width: number }> = {
  Notepad: { width: 300 },
  'Audio Player': { width: 330 },
  Properties: { width: 300 },
  Calculator: { width: 330 },
};

const defineMinHeights: Record<Application | string, { height: number }> = {
  Notepad: { height: 245 },
  Calculator: { height: 315 },
  'File Explorer': { height: 315 },
  'Audio Player': { height: 315 },
  'Video Player': { height: 245 },
  'Image Viewer': { height: 245 },
  Properties: { height: 350 },
};

const defineFixedSizes: Record<Application | string, { width: number; height: number }> = {
  'Confirm Dialog': { width: 400, height: 300 },
};

// Windows that cannot be minified
const defineInlines: Record<string, boolean> = { Properties: true };

// Windows that should not show a svg in the window header
const defineDisableIcons: Record<Application | string, boolean> = {
  'Properties': true,
  'Confirm Dialog': true,
};

// Windows that should have no window control buttons in the header
const defineDisableControls: Record<Application | string, boolean> = { 'Confirm Dialog': true };

export const windowsConfig = (windowName: string) => {
  return {
    getMinWidth: (): number | null => defineMinWidths[windowName]?.width ?? null,
    getMinHeight: (): number | null => defineMinHeights[windowName]?.height ?? null,
    getFixedSize: (): { width: number; height: number } | null =>
      defineFixedSizes[windowName] ?? null,
    getIsInline: (): boolean => defineInlines[windowName] ?? false,
    getDisableIcon: (): boolean => defineDisableIcons[windowName] ?? false,
    getDisableControls: (): boolean => defineDisableControls[windowName] ?? false,
  };
};
