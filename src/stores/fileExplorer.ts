import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type ItemSizeKeys } from '@/types/FileExplorerTypes.ts';
import type { FileItem, FileType } from '@/types/ItemTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSizeKey = ref<ItemSizeKeys>('medium');

  const filePathAtWindow = ref<{ windowId: string; path: string[] }>();
  const fileSelectState = ref<{
    active: boolean;
    windowId: string;
    allowedFileTypes: FileType[];
  } | null>(null);

  const isInFileSelectStateReturnValue = ref<{ windowId: string; fileId: number; value: string | FileItem; }>();

  function updateItemSize(itemSizeKey: ItemSizeKeys) {
    currentFileItemSizeKey.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSizeKey.value);
  }

  function setFileExplorerWindowAsFileSelect(windowId: string, allowedFileTypes: FileType[]) {
    fileSelectState.value = {
      active: true,
      windowId: windowId,
      allowedFileTypes: allowedFileTypes,
    };
  }

  function setFilePathAtWindow(windowId: string, path: string[]) {
    filePathAtWindow.value = { windowId: windowId, path: path };
  }

  return {
    currentFileItemSizeKey,
    updateItemSize,
    filePathAtWindow,
    setFilePathAtWindow,
    setFileExplorerWindowAsFileSelect,
    fileSelectState,
    isInFileSelectStateReturnValue,
  };
});
