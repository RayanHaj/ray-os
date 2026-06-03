import { computed } from 'vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';

export const useGetTileId = (position: { x: number; y: number }) =>
  computed(() => (position.x - 1) * useTileCountGrid().y.value + position.y);
