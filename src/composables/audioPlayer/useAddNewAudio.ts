import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';
import type { Ref } from 'vue';

export function useAddNewAudio(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<LoadedAudio | undefined>,
  newAudio: LoadedAudio,
  windowId: string,
  options?: {
    load?: boolean
  }
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

  if (options?.load) {
    useSetCurrentLoadedAudioByUrl(audioUrl, audioObject, loadedAudios, currentLoadedAudio);
  }
}

export function useSetCurrentLoadedAudioByUrl(
  audioUrl: string,
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<LoadedAudio | undefined>,
) {
  const newLoadedAudio = loadedAudios.value.find((audio) => audio.audioUrl === audioUrl);
  if (!newLoadedAudio) return;

  currentLoadedAudio.value = newLoadedAudio;

  if (audioObject.value) {
    audioObject.value.src = audioUrl;
  }
}
