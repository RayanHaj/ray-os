import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile } from '@/types/Tile.ts'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(70);
  const tileHeight = ref(70);
  const taskbarHeight = ref(0);
  const tiles = ref<Tile[]>([]);

  return {
    tileWidth,
    tileHeight,
    taskbarHeight
  }
});
