import { defineStore } from 'pinia';
import type { FileType } from '@/types/itemTypes.ts';
import { readonly, ref } from 'vue';

export type FileProperties = {
  name: string,
  type: FileType | 'Directory' | 'Application' | 'File',
  location: string,
  windowId: string
}

export const useFilePropertiesStore = defineStore('fileProperties', () => {
  const loadedFileProperty = ref<FileProperties>();

  function loadFileProperties(fileProperties: FileProperties) {
    console.log(fileProperties)
    loadedFileProperty.value = fileProperties;
  }

  return {
    loadedFileProperties: readonly(loadedFileProperty),
    loadFileProperties
  }
});
