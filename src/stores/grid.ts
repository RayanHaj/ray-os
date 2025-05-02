import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile } from '@/types/Tile.ts'
import { useBrowserStore } from '@/stores/browser.ts'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(90)
  const tileHeight = ref(90)
  const taskbarHeight = ref(0)
  const tiles = ref<Tile[]>([])

  const browserStore = useBrowserStore()

  function updateTileContent() {
    const filledTiles = tiles.value.filter((tile) => tile.label !== '')

    const newTiles: Tile[] = []

    if (browserStore.windowResizing === false) {
      if (filledTiles.length === 0) {
        const tile: Tile = {
          label: 'File Explorer',
          content: {
            id: 1,
            type: 'application',
            iconImageName: 'IconFileExplorer',
          },
        }
        const tile2: Tile = {
          label: 'File Explorer',
          content: {
            id: 2,
            type: 'application',
            iconImageName: 'IconFileExplorer',
          },
        }
        const tile3: Tile = {
          label: 'File Explorer',
          content: {
            id: 3,
            type: 'application',
            iconImageName: 'IconFileExplorer',
          },
        }
        newTiles.push(tile);
        newTiles.push(tile2);
        newTiles.push(tile3);
      }

      tiles.value = []
      if (filledTiles.length > 0) {
        filledTiles.forEach((tile) => {
          newTiles.push(tile)
        })
      }

      tiles.value = newTiles.sort((a, b) => a.content?.id - b.content?.id)
    }

    console.log(tiles.value)
  }

  function pushTile(tile: Tile) {
    if (tile.content) {
      tiles.value[tile.content.id - 1] = tile
    }
  }

  return {
    tiles,
    tileWidth,
    tileHeight,
    taskbarHeight,
    updateTileContent,
    pushTile,
  }
})
