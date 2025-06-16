import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import type { Sounds } from '@/types/Sounds.ts';
import { useGetAudioForSereneSounds } from '@/composables/useGetAudioForSereneSounds.ts';

export async function useGetInitialSounds() {
  const soundNames: { name: AllowedSoundNames, type: string }[] =
    [
      {name: "heavy rain loop", type: 'water'},
      {name: "heavy rain window loop", type: 'water'},
      {name: "ocean waves", type: "water"}
    ]

  const object: Sounds = {} as Sounds;
  for (const sound of soundNames) {
    const audio = await useGetAudioForSereneSounds(sound.name);
    if (audio instanceof Error) {
      return;
    }

    object[sound.name] = {
      type: sound.type,
      audio: audio
    }
  }

  return object;
}
