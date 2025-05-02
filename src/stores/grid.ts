import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile } from '@/types/Tile.ts'
import { useBrowserStore } from '@/stores/browser.ts'
import initTiles from '@/json/initTiles.json'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(90)
  const tileHeight = ref(90)
  const taskbarHeight = ref(0)
  const tiles = ref<Tile[]>([])

  const browserStore = useBrowserStore()

  function updateTileContent() {
    const filledTiles = tiles.value.filter((tile) => tile.label !== '')

    if (browserStore.windowResizing === true) {
      return
    }

    let newTiles: Tile[] = [];
    if (filledTiles.length === 0) {
      newTiles = setInitialValues();
    }

    tiles.value = [];
    if (filledTiles.length > 0) {
      filledTiles.forEach((tile) => {
        newTiles.push(tile)
      })
    }

    tiles.value = newTiles.sort((a, b) => a.content?.id - b.content?.id);
  }

  function setInitialValues() {
    return initTiles.reduce((accumulator, value) => {
      if (value.content.type !== 'application') return accumulator;

      const tile: Tile = {
        label: value.label,
        content: {
          id: value.content.id,
          type: value.content.type,
          iconImageName: value.content.iconImageName,
        },
      }

      accumulator.push(tile);
      return accumulator
    }, [] as Tile[]);
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
