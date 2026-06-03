import type { Ref } from 'vue';
import type { LoadedAudio } from '@/types/audioPlayerTypes.ts';

export function useGetLoadedAudioByAudioUrl(
  loadedAudios: Ref<LoadedAudio[]>,
  audioUrl: string | undefined,
): LoadedAudio | undefined {
  if (!audioUrl) return;
  return loadedAudios.value.find((audio) => audio.audioUrl === audioUrl);
}
