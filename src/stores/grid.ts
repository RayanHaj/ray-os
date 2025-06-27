import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item } from '@/types/Item.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useFileStore } from '@/stores/file.ts';

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(90);
  const tileHeight = ref(90);
  const items = ref<Item[]>([]);

  const browserStore = useBrowserStore();
  const fileStore = useFileStore();

  function updateTileContent() {
    const filledTiles = items.value.filter((item) => item.label !== '');

    if (browserStore.windowResizing === true) {
      return;
    }

    let newTiles: Item[] = [];
    if (filledTiles.length === 0) {
      newTiles = fileStore.files;
    }

    items.value = [];
    if (filledTiles.length > 0) {
      filledTiles.forEach((tile) => {
        newTiles.push(tile);
      });
    }

    items.value = newTiles.sort((a, b) => a.content?.id - b.content?.id);
  }

  function pushTile(tile: Item) {
    if (tile.content) {
      items.value[tile.content.id - 1] = tile;
    }
  }

  return { items, tileWidth, tileHeight, updateTileContent, pushTile };
});
