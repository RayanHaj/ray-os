import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {

  const rootDirectory = ref('C:');
  const updateFileSystemVal = ref(false);

  const rootId = ref<number>(1);
  const applicationsDirId = ref<number>(2);
  const wallpapersDirId = ref<number>(3);

  function updateFileSystem() {
    updateFileSystemVal.value = !updateFileSystemVal.value;
  }
  return {
    rootDirectory,
    updateFileSystemVal,
    updateFileSystem,
    rootId,
    applicationsDirId,
    wallpapersDirId,
  };
});
