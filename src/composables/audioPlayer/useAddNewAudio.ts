import type { LoadedAudio } from '@/types/audioPlayerTypes.ts';
import type { Ref } from 'vue';

export function useAddNewAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<string | undefined>,
  newAudio: LoadedAudio,
  windowId: string,
  options?: { loadAudio?: boolean },
) {
  if (!newAudio.file) return;

  const audioUrl = URL.createObjectURL(newAudio.file);

  loadedAudios.value.push({
    windowId: windowId,
    file: newAudio.file,
    audioUrl: audioUrl,
    fileId: newAudio.fileId,
    isPlaying: newAudio.isPlaying,
    playlistName: newAudio.playlistName,
  });

  if (options?.loadAudio) {
    useSetCurrentLoadedAudioByUrl(audioUrl, audioObject, loadedAudios, currentLoadedAudio);
  }
}

export function useSetCurrentLoadedAudioByUrl(
  audioUrl: string,
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<string | undefined>,
) {
  const newLoadedAudio = loadedAudios.value.find((audio) => audio.audioUrl === audioUrl);
  if (!newLoadedAudio) return;

  currentLoadedAudio.value = newLoadedAudio.audioUrl;

  if (audioObject.value) {
    audioObject.value.src = audioUrl;
  }
}
