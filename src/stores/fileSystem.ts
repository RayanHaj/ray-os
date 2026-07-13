import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {
  const ROOT_DIR_NAME = 'C:';
  const ROOT_DIR_ID = 1;
  const APPLICATIONS_DIR_ID = 2;
  const WALLPAPERS_DIR_ID = 3;

  const APPLICATION_DIR_PATH = `${ROOT_DIR_NAME}/Applications`;

  const updateFileSystemSignal = ref(false);
  function updateFileSystem() {
    updateFileSystemSignal.value = !updateFileSystemSignal.value;
  }

  return {
    ROOT_DIR_NAME,
    APPLICATION_DIR_PATH,
    ROOT_DIR_ID,
    APPLICATIONS_DIR_ID,
    WALLPAPERS_DIR_ID,
    updateFileSystemSignal,
    updateFileSystem,
  };
});
