import { useGridStore } from '@/stores/grid.ts'
import { computed } from 'vue'
import { useBrowserStore } from '@/stores/browser.ts'
import { useTaskbarStore } from '@/stores/taskbar.ts'

export function useTileCountGrid() {
  const browserStore = useBrowserStore();
  const gridStore = useGridStore();
  const taskbarStore = useTaskbarStore();

  const x =
    computed(() => Math.floor(browserStore.width / gridStore.tileWidth));
  const y =
    computed(() => Math.floor((browserStore.height - taskbarStore.taskbarHeight) / gridStore.tileHeight));

  return { x, y }
}
