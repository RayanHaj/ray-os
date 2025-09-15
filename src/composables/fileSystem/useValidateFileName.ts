export function useValidateFileName(fileName: string) {
  const MAX_NAME_LENGTH = 100;
  return fileName.length <= MAX_NAME_LENGTH;
}
