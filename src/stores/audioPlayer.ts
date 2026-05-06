import { defineStore } from 'pinia';
import type { AudioPlayerPage } from '@/types/AudioPlayerTypes.ts';
import { computed, ref, type Ref } from 'vue';
import { isAudioType } from '@/types/ItemTypes.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';

export const useAudioPlayerStore = defineStore('audioPlayer', () => {
  const selectedPage: Ref<AudioPlayerPage> = ref('Home');

  const loadedAudio: Ref<LoadedImage> = ref({ windowId: null, file: null });
  const hasOpenInstance: Ref<boolean> = ref(false);
  const audioElements: Ref<Map<string, { el: HTMLAudioElement; file: File }>> = ref(new Map());

  function initAudioFileAndUrl(windowId: string, audioFile: File): boolean {
    if (!isAudioType(audioFile.type)) {
      return false;
    }

    loadedAudio.value = { windowId: windowId, file: audioFile };
    return true;
  }

  function setAudioElement(windowId: string, el: HTMLAudioElement | null, file?: File) {
    if (el === null) {
      audioElements.value.delete(windowId);
    } else if (file) {
      audioElements.value.set(windowId, { el, file });
    }
  }

  function play(windowId: string) {
    audioElements.value.get(windowId)?.el.play();
  }

  function pause(windowId: string) {
    audioElements.value.get(windowId)?.el.pause();
  }

  function pauseAll() {
    audioElements.value.forEach((element) => element.el.pause());
  }

  function playAll() {
    audioElements.value.forEach((element) => element.el.play());
  }

  const audioElementCount = computed(() => audioElements.value.size);

  function getAudioFileName(windowId?: string): string | undefined {
    if (!windowId) {
      if (audioElements.value.size > 0) {
        const [firstElement] = audioElements.value.values();
        return firstElement.file.name;
      } else {
        return;
      }
    }

    const audioElement = audioElements.value.get(windowId);
    if (!audioElement) {
      if (audioElements.value.size > 0) {
        const [firstElement] = audioElements.value.values();
        return firstElement.file.name;
      } else {
        return;
      }
    }

    return audioElement.file.name;
  }

  return {
    selectedPage,
    loadedAudio,
    initAudioFileAndUrl,
    hasOpenInstance,
    setAudioElement,
    audioElementCount,
    getAudioFileName,
    play,
    pause,
    pauseAll,
    playAll
  };
});
