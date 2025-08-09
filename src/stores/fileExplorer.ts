import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type ItemSizeKeys } from '@/types/FileExplorerTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSizeKey = ref<ItemSizeKeys>('medium');

  const filePathAtWindowId = ref<{ windowId: string, path: string[] }>();
  function updateItemSize(itemSizeKey: ItemSizeKeys) {
    currentFileItemSizeKey.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSizeKey.value);
  }

  function setFilePathAtWindow(windowId: string, path: string[]) {
    filePathAtWindowId.value = { windowId: windowId, path: path };
  }

  return { currentFileItemSizeKey, updateItemSize, filePathAtWindowId, setFilePathAtWindow };
});
