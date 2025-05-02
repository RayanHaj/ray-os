import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDebounce } from '@/composables/useDebounce.ts'
import { useGridStore } from '@/stores/grid.ts'

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);
  const windowResizing = ref(false);
  const gridStore = useGridStore();

  const debouncedLog = useDebounce(() => {
    windowResizing.value = false;
    gridStore.updateTileContent();
  }, 10);

  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
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

  return { width, height, windowResizing, startListening, stopListening }
});
