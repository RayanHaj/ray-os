import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LoadedNotepadFile, NotepadFile } from '@/types/notepadTypes.ts';

export const useNotepadStore = defineStore('notepad', () => {
  const loadedFile = ref<LoadedNotepadFile>();

  const initializeNotepadFile = (windowId: string, notepadFile: NotepadFile) =>
    (loadedFile.value = { windowId: windowId, ...notepadFile });

  return { initializeNotepadFile, loadedFile };
});
