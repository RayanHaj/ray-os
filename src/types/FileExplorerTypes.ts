export const itemSizes = {
  small: { font: 10, size: 30 },
  medium: { font: 12, size: 50 },
  large: { font: 14, size: 60 },
} as const;

export type ItemSize = (typeof itemSizes)[keyof typeof itemSizes];
export type ItemSizeKeys = keyof typeof itemSizes;
