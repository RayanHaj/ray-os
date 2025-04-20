import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);

  updateSizes();
  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  function startListening() {
    addEventListener('resize', () => updateSizes());
  }

  function stopListening() {
    removeEventListener('resize', () => updateSizes());
  }

  return { width, height, startListening, stopListening }
});
