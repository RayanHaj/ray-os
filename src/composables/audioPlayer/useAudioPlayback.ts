import type { Ref } from 'vue';
import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';
import { useSetCurrentLoadedAudioByUrl } from '@/composables/audioPlayer/useAddNewAudio.ts';

export async function usePlayAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<LoadedAudio | undefined>,
  audioUrl?: string,
) {
  if (audioObject.value === null) return;

  if (audioUrl !== undefined) {
    useSetCurrentLoadedAudioByUrl(audioUrl, audioObject, loadedAudios, currentLoadedAudio);

    for (const loadedAudio of loadedAudios.value) {
      if (loadedAudio.audioUrl === audioUrl) continue;
      loadedAudio.isPlaying = false;
    }
  } else if (!audioObject.value.src) {
    audioObject.value.src = currentLoadedAudio.value?.audioUrl ?? '';
  }

  if (audioObject.value) {
    const audioIsLoaded = audioObject.value.readyState >= 2;

    if (!currentLoadedAudio.value) {
      currentLoadedAudio.value = loadedAudios.value.find((audio) => audio.audioUrl === audioUrl);
    }

    const currentLoadedAudioIndex = loadedAudios.value.findIndex(
      (audio) => audio.audioUrl === currentLoadedAudio.value?.audioUrl,
    );

    if (!audioIsLoaded) {
      audioObject.value.addEventListener(
        'canplaythrough',
        () => {
          if (audioObject.value && currentLoadedAudio.value) {
            audioObject.value.play();
            currentLoadedAudio.value.isPlaying = true;

            if (currentLoadedAudioIndex === -1) return;
            loadedAudios.value[currentLoadedAudioIndex].isPlaying = true;
          }
        },
        { once: true },
      );
    } else {
      if (currentLoadedAudio.value) {
        await audioObject.value.play();
        currentLoadedAudio.value.isPlaying = true;

        if (currentLoadedAudioIndex === -1) return;
        loadedAudios.value[currentLoadedAudioIndex].isPlaying = true;
      }
    }
  }
}

export function usePauseAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<LoadedAudio | undefined>,
) {
  if (audioObject.value === null) return;

  if (!currentLoadedAudio.value || currentLoadedAudio.value.audioUrl !== audioObject.value.src)
    return;

  const currentLoadedAudioIndex = loadedAudios.value.findIndex(
    (audio) => audio.audioUrl === currentLoadedAudio.value?.audioUrl,
  );

  audioObject.value.pause();
  currentLoadedAudio.value.isPlaying = false;

  if (currentLoadedAudioIndex === -1) return;
  loadedAudios.value[currentLoadedAudioIndex].isPlaying = false;
}
