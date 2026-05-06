import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type FileItemSizeKey } from '@/types/FileExplorerTypes.ts';
import type { FileItem, FileType } from '@/types/ItemTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSize = ref<FileItemSizeKey>('small');

  const filePathAtWindow = ref<{ windowId: string; path: string[] }>();
  const fileSelectState = ref<{
    active: boolean;
    windowId: string;
    fileExplorerWindowId: string;
    allowedFileTypes: FileType[];
  }[]>([]);

  const isInFileSelectStateReturnValue =
    ref<{ windowId: string; fileId: number; value: string | FileItem }[]>([]);

  function updateItemSize(itemSizeKey: FileItemSizeKey) {
    currentFileItemSize.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSize.value);
  }

  function setFileExplorerWindowAsFileSelect(windowId: string, fileExplorerWindowId: string, allowedFileTypes: FileType[]) {
    fileSelectState.value.push({
      active: true,
      windowId: windowId,
      fileExplorerWindowId: fileExplorerWindowId,
      allowedFileTypes: allowedFileTypes,
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
    isInFileSelectStateReturnValue,
  };
});
