import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useDebounce } from '@/composables/helpers/useDebounce.ts';
import { useGridStore } from '@/stores/grid.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);
  const heightExcTaskbar = ref(0);
  const windowResizing = ref(false);
  const gridStore = useGridStore();

  const debouncedLog = useDebounce(() => {
    windowResizing.value = false;
    gridStore.updateTileContent();
  }, 10);

  const taskbarStore = useTaskbarStore();

  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    heightExcTaskbar.value = height.value - taskbarStore.taskbarHeight;
    debouncedLog();
  }

  function startListening() {
    updateSizes();
    addEventListener('resize', () => {
      updateSizes();
      windowResizing.value = true;
    });
  }

  function stopListening() {
    removeEventListener('resize', () => updateSizes());
  }

  return { width, height, heightExcTaskbar, windowResizing, startListening, stopListening };
});
