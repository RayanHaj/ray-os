import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type FileItemSizeKey, type FileSelectReturnItem } from '@/types/FileExplorerTypes.ts';
import type { FileType } from '@/types/ItemTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSize = ref<FileItemSizeKey>('small');

  const filePathAtWindow = ref<{ windowId: string; path: string[] }>();
  const fileSelectState = ref<{
    active: boolean;
    targetWindowId: string;
    fileExplorerWindowId: string;
    allowedFileTypes: FileType[];
    multiSelect: boolean;
  }[]>([]);

  const fileSelectReturnValue =
    ref<{ windowId: string; value: FileSelectReturnItem[] }[]>([]);

  function updateItemSize(itemSizeKey: FileItemSizeKey) {
    currentFileItemSize.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSize.value);
  }

  function setFileExplorerWindowAsFileSelect(windowId: string, fileExplorerWindowId: string, allowedFileTypes: FileType[], multiSelect: boolean = false) {
    fileSelectState.value.push({
      active: true,
      targetWindowId: windowId,
      fileExplorerWindowId: fileExplorerWindowId,
      allowedFileTypes: allowedFileTypes,
      multiSelect: multiSelect
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
    fileSelectState,
    fileSelectReturnValue,
  };
});
