import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotepadStore = defineStore('notepad', () => {
  const loadedFile = ref<{ windowId: string; fileId: number; fileName: string; text: string }>();

  function initializeNotepadFile(windowId: string, fileId: number, fileName: string, text: string) {
    loadedFile.value = { windowId: windowId, fileId: fileId, fileName: fileName, text: text };
  }

  return { initializeNotepadFile, loadedFile };
});
