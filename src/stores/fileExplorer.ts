import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type ItemSizeKeys } from '@/types/FileExplorerTypes.ts';

export const useFileExplorerStore = defineStore('fileExplorer', () => {
  const currentFileItemSizeKey = ref<ItemSizeKeys>('medium');
  function updateItemSize(itemSizeKey: ItemSizeKeys) {
    currentFileItemSizeKey.value = itemSizeKey;
    localStorage.setItem('fileItemSize', currentFileItemSizeKey.value);
  }

  return { currentFileItemSizeKey, updateItemSize };
});
