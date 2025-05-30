import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {
  const rootDirectory = ref('root');
  const updateFileSystemVal = ref(false);

  function updateFileSystem() {
    updateFileSystemVal.value = !updateFileSystemVal.value;
  }
  return {
    rootDirectory,
    updateFileSystemVal,
    updateFileSystem,
  };
});
