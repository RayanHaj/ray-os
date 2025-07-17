import { useGridStore } from '@/stores/grid.ts';
import { computed } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';

export function useTileCountGrid() {
  const browserStore = useBrowserStore();
  const gridStore = useGridStore();
  const taskbarStore = useTaskbarStore();

  const x = computed(() => Math.max(0, Math.floor(browserStore.width / gridStore.tileWidth - 0.5)));
  const y = computed(() =>
    Math.max(
      0,
      Math.floor((browserStore.height - taskbarStore.taskbarHeight) / gridStore.tileHeight),
    ),
  );

  return { x, y };
}
