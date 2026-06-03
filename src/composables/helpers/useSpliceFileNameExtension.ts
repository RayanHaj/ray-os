import { fileExtensions } from '@/types/itemTypes.ts';

export function useSpliceFileNameExtension(fileName: string) {
  if (!fileName) return '';

  for (const fileExtension of Object.values(fileExtensions)) {
    const foundIndex = fileName.lastIndexOf(`.${fileExtension}`);
    if (foundIndex !== -1) {
      return fileName.slice(0, foundIndex);
    }
  }

  return fileName;
}
