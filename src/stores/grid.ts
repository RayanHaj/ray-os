import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile } from '@/types/Tile.ts'
import { useBrowserStore } from '@/stores/browser.ts'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(90);
  const tileHeight = ref(90);
  const taskbarHeight = ref(0);
  const tiles = ref<Tile[]>([]);


  const browserStore = useBrowserStore();
  function pushAllTiles(verticalTileCount: number, horizontalTileCount: number) {
    tiles.value = [];
    if (browserStore.windowResizing === false) {
      for (let y = 0; y < verticalTileCount; y++) {
        for (let x = 0; x < horizontalTileCount; x++) {
          const id = (y * horizontalTileCount + x) + 1;
          let tile: Tile;
          if (id === 1) {
            tile = { id: id, iconImageName: 'IconFileExplorer', label: 'File Explorer' };
          } else {
            tile = { id: id, iconImageName: '', label: '' };
          }
          tiles.value.push(tile);
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
