import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item } from '@/types/ItemTypes.ts';
import { useFileStore } from '@/stores/file.ts';

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(75);
  const tileHeight = ref(75);
  const items = ref<Item[]>([]);

  const fileStore = useFileStore();

  function updateTileContent() {
    const filledTiles = items.value.filter((item) => item.label !== '');

    let newTiles: Item[] = [];
    if (filledTiles.length === 0) {
      newTiles = [...fileStore.files];
    }

    if (filledTiles.length > 0) {
      filledTiles.forEach((tile) => {
        newTiles.push(tile);
      });
    }

    items.value = newTiles.sort((a, b) => a.content?.id - b.content?.id);
  }

  return { items, tileWidth, tileHeight, updateTileContent };
});
