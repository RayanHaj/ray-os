import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Item } from '@/types/Item.ts';
import { useFileStore } from '@/stores/file.ts';

export const useTaskbarStore = defineStore('taskbar', () => {
  const taskbarHeight = ref(90);
  const items = ref<Item[]>([]);

  const fileStore = useFileStore();

  function initializeTaskbar() {
    items.value = fileStore.files;
  }

  return { items, taskbarHeight, initializeTaskbar };
});
