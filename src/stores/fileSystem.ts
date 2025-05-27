import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {
  const rootDirectories = ref(['C:', 'applications', 'files', 'pictures']);

  return {
    rootDirectories
  }
});
