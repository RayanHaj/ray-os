import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', () => {
  const files = ref([]);
});
