import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LoadedNotepadFile, NotepadFile } from '@/types/notepadTypes.ts';
import { useWindowStore } from '@/stores/window.ts';

export const useNotepadStore = defineStore('notepad', () => {
  const loadedFile = ref<LoadedNotepadFile>();

  const initializeNotepadFile = (windowId: string, notepadFile: NotepadFile) => {
    loadedFile.value = { windowId: windowId, ...notepadFile };
    useWindowStore().pushOpenWindowReference('Notepad');
  };

  return { initializeNotepadFile, loadedFile };
});
