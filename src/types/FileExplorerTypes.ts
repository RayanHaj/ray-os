export const itemSizes = {
  small: { font: 9, size: 30 },
  medium: { font: 10, size: 40 },
  large: { font: 10, size: 50 },
} as const;

export type FileItemSizeValue = (typeof itemSizes)[keyof typeof itemSizes];
export type FileItemSizeKey = keyof typeof itemSizes;
export const fileItemSizes = Object.keys(itemSizes) as FileItemSizeKey[];
