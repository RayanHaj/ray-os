import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useTaskbarStore } from '@/stores/taskbar.ts';

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);
  const heightExcTaskbar = ref(0);

  const taskbarStore = useTaskbarStore();

  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    heightExcTaskbar.value = (height.value - taskbarStore.taskbarHeight) + 1;
  }

  function startListening() {
    updateSizes();
    addEventListener('resize', () => {
      updateSizes();
    });
  }

  function stopListening() {
    removeEventListener('resize', () => updateSizes());
  }

  return { width, height, heightExcTaskbar, startListening, stopListening };
});
