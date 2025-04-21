import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile } from '@/types/Tile.ts'
import { useBrowserStore } from '@/stores/browser.ts'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(70);
  const tileHeight = ref(70);
  const taskbarHeight = ref(0);
  const tiles = ref<Tile[]>([]);


  const browserStore = useBrowserStore();
  function pushAllTiles(verticalTileCount: number, horizontalTileCount: number) {
    tiles.value = [];
    if (browserStore.windowResizing === false) {
      for (let y = 0; y < verticalTileCount; y++) {
        for (let x = 0; x < horizontalTileCount; x++) {
          const id = (y * horizontalTileCount + x + 1);
          const tile: Tile = { id: id, iconUrl: '', label: '' };
          tiles.value.push(tile)
        }
      }
    }
  }

  return {
    tiles,
    tileWidth,
    tileHeight,
    taskbarHeight,
    pushAllTiles
  }
});
