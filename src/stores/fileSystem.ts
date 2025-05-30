import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {
  const rootDirectories = ref(['C:', 'applications', 'files', 'pictures']);
  const updateFileSystemVal = ref(false);

  function updateFileSystem() {
    updateFileSystemVal.value = !updateFileSystemVal.value;
  }
  return {
    rootDirectories,
    updateFileSystemVal,
    updateFileSystem,
  };
});
