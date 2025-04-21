import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDebounce } from '@/composables/useDebounce.ts'
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);
  const windowResizing = ref(false);
  const gridStore = useGridStore();
  const tileCount = useTileCountGrid();

  const debouncedLog = useDebounce(() => {
    windowResizing.value = false;
    gridStore.pushAllTiles(tileCount.y.value, tileCount.x.value);
  }, 10);

  updateSizes();
  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    debouncedLog();
  }

  function startListening() {
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
