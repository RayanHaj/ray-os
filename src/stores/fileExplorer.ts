import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { type FileItemSizeKey, type FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import type { FileType } from '@/types/itemTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSize = ref<FileItemSizeKey>('small');

  const filePathAtWindow = ref<{ windowId: string; path: string[] }>();
  const fileSelectState = ref<
    {
      active: boolean;
      targetWindowId: string;
      fileExplorerWindowId: string;
      allowedFileTypes: FileType[];
      multiSelect: boolean;
    }[]
  >([]);

  const filesHasBeenUploadedInWindows = ref<Record<string, File[]>>({});

  function getFilesUploadedInWindow(windowId: string): File[] | null {
    const found = filesHasBeenUploadedInWindows.value[windowId];

    if (found) {
      delete filesHasBeenUploadedInWindows.value[windowId];
      return found;
    }

    return null;
  }

  function setFilesUploadedInWindow(windowId: string, files: File[]): void {
    filesHasBeenUploadedInWindows.value[windowId] = files;
  }

  function watchFilesUploadedInWindow(
    windowId: string,
    callback: (files: File[]) => Promise<void>,
  ) {
    watch(
      () => filesHasBeenUploadedInWindows.value,
      async (newValue) => {
        const found = newValue[windowId];
        if (!found) return;

        await callback(found);
        delete filesHasBeenUploadedInWindows.value[windowId];
      }, {deep: true}
    );
  }

  const fileSelectReturnValue = ref<{ windowId: string; value: FileSelectReturnItem[] }[]>([]);

  function updateItemSize(itemSizeKey: FileItemSizeKey) {
    currentFileItemSize.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSize.value);
  }

  function setFileExplorerWindowAsFileSelect(
    windowId: string,
    fileExplorerWindowId: string,
    allowedFileTypes: FileType[],
    multiSelect: boolean = false,
  ) {
    fileSelectState.value.push({
      active: true,
      targetWindowId: windowId,
      fileExplorerWindowId: fileExplorerWindowId,
      allowedFileTypes: allowedFileTypes,
      multiSelect: multiSelect,
    });
  }

  function setFilePathAtWindow(windowId: string, path: string[]) {
    filePathAtWindow.value = { windowId: windowId, path: path };
  }

  return {
    currentFileItemSize,
    updateItemSize,
    filePathAtWindow,
    setFilePathAtWindow,
    setFileExplorerWindowAsFileSelect,
    getFilesUploadedInWindow,
    setFilesUploadedInWindow,
    watchFilesUploadedInWindow,
    fileSelectState,
    fileSelectReturnValue,
  };
});
