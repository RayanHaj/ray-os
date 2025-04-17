import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGridStore = defineStore('grid', () => {
  const tileWidth = ref(70);
  const tileHeight = ref(70);

  return {
    tileWidth,
    tileHeight
  }
});
