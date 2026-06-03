import type { Ref } from 'vue';
import type { LoadedAudio } from '@/types/audioPlayerTypes.ts';
import { useSetCurrentLoadedAudioByUrl } from '@/composables/audioPlayer/useAddNewAudio.ts';
import { useGetLoadedAudioByAudioUrl } from '@/composables/audioPlayer/useGetLoadedAudioByAudioUrl.ts';

export async function usePlayAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudioUrl: Ref<string | undefined>,
  audioUrl?: string,
) {
  if (audioObject.value === null) return;

  const currentLoadedAudio = useGetLoadedAudioByAudioUrl(loadedAudios, currentLoadedAudioUrl.value);

  if (audioUrl !== undefined) {
    useSetCurrentLoadedAudioByUrl(audioUrl, audioObject, loadedAudios, currentLoadedAudioUrl);

    for (const loadedAudio of loadedAudios.value) {
      if (loadedAudio.audioUrl === audioUrl) continue;
      loadedAudio.isPlaying = false;
    }
  } else if (!audioObject.value.src) {
    audioObject.value.src = currentLoadedAudio?.audioUrl ?? '';
  }

  if (audioObject.value) {
    const audioIsLoaded = audioObject.value.readyState >= 2;

    if (!currentLoadedAudioUrl.value) {
      currentLoadedAudioUrl.value = audioUrl;
    }

    const currentLoadedAudioIndex = loadedAudios.value.findIndex(
      (audio) => audio.audioUrl === currentLoadedAudioUrl.value,
    );

    async function playAudio() {
      await audioObject.value?.play();

      if (currentLoadedAudioIndex === -1) return;
      loadedAudios.value[currentLoadedAudioIndex].isPlaying = true;
    }

    if (!audioIsLoaded) {
      audioObject.value.addEventListener('canplaythrough', async () => {
        await playAudio();
      }, { once: true });
    } else {
      await playAudio();
    }
  }
}

export function usePauseAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudioUrl: Ref<string | undefined>,
) {
  if (audioObject.value === null) return;

  if (!currentLoadedAudioUrl.value || currentLoadedAudioUrl.value !== audioObject.value.src)
    return;

  const currentLoadedAudioIndex = loadedAudios.value.findIndex(
    (audio) => audio.audioUrl === currentLoadedAudioUrl.value,
  );

  audioObject.value.pause();

  if (currentLoadedAudioIndex === -1) return;
  loadedAudios.value[currentLoadedAudioIndex].isPlaying = false;
}
