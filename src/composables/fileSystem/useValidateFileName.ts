import { useToastStore } from '@/stores/toast.ts';

export function useValidateFileName(fileName: string, windowId: string) {
  const MAX_NAME_LENGTH = 100;

  console.log(fileName)


  if (fileName.trim().length === 0) {
    useToastStore().createToast('enter file name', 'error', 5000, 'window', windowId);
    return false;
  } else if (fileName.length > MAX_NAME_LENGTH) {
    useToastStore().createToast('file name to long', 'error', 5000, 'window', windowId);
    return false;
  }

  return true;
}
