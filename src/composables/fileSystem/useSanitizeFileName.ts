import { fileExtensions, type FileType } from '@/types/ItemTypes.ts';

export function useSanitizeFileName(fileName: string, type: FileType) {
  const fileNameWithoutExtension = fileName.split('.')[0];
  if (fileNameWithoutExtension.trim().length === 0) {
    return '';
  }

  return `${fileNameWithoutExtension}.${fileExtensions[type]}`;
}
