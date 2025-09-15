export function useSanitizeFileName(fileName: string) {
  return `${fileName.split('.')[0]}.txt`;
}
