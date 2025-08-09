import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotepadStore = defineStore('notepad', () => {
  const loadedFile = ref<{ windowId: string; fileName: string; text: string }>();

  function initializeNotepadFile(windowId: string, fileName: string, text: string) {
    loadedFile.value = { windowId: windowId, fileName: fileName, text: text };
  }

  return { initializeNotepadFile, loadedFile };
});
