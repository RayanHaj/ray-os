export function useSanitizeFileName(fileName: string) {
  const fileNameWithoutExtension = fileName.split('.')[0];
  if (fileNameWithoutExtension.trim().length === 0) {
    return '';
  }

  return `${fileNameWithoutExtension}.txt`;
}
