import { defineStore } from 'pinia';
import type { LoadedAudio } from '@/types/audioPlayerTypes.ts';
import { ref, type Ref } from 'vue';
import { isAudioType } from '@/types/itemTypes.ts';

export const useAudioPlayerStore = defineStore('audioPlayer', () => {
  const loadedAudio: Ref<LoadedAudio> = ref({
    windowId: null,
    file: null,
    fileId: -1,
    playlistName: '',
  });

  function initAudioFileAndUrl(windowId: string, audioFile: File, fileId: number): boolean {
    if (!isAudioType(audioFile.type)) {
      return false;
    }

    loadedAudio.value = { windowId: windowId, file: audioFile, fileId, isPlaying: false, playlistName: '' };
    return true;
  }

  function resetLoadedAudio() {
    loadedAudio.value = { windowId: null, file: null, fileId: -1, playlistName: '' };
  }

  return {
    loadedAudio,
    resetLoadedAudio,
    initAudioFileAndUrl
  };
});
