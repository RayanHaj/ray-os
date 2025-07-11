import { fileExtensions } from '@/types/ItemTypes.ts';
import type { FileTypes } from '@/types/ItemTypes.ts';

export function useFileNameParser(fileName: string, type: FileTypes): string | null {
  const fileExtension = fileExtensions[type];
  if (!fileExtension) {
    return null;
  }

  if (fileName.endsWith(`.${fileExtension}`)) {
    return fileName;
  }

  return `${fileName}.${fileExtension}`;
}
