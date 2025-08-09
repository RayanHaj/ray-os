import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystemStore = defineStore('fileSystem', () => {
  const rootDirectory = ref('C:');
  const updateFileSystemVal = ref(false);
  const rootId = ref<number>(1);

  function updateFileSystem() {
    updateFileSystemVal.value = !updateFileSystemVal.value;
  }
  return { rootDirectory, updateFileSystemVal, updateFileSystem, rootId };
});
