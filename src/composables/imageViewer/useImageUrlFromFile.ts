import { isImageType } from '@/types/ItemTypes.ts';

export function useImageUrlFromFile(imageFile: File | null): string | null {
  if (imageFile === null) return null;
  if (!isImageType(imageFile.type)) return null;

  return URL.createObjectURL(imageFile);
}
