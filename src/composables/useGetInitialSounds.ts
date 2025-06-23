import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import type { Sounds } from '@/types/Sounds.ts';
import { useGetAudioForSereneSounds } from '@/composables/useGetAudioForSereneSounds.ts';
import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';

export async function useGetInitialSounds() {
  const soundNames: { name: AllowedSoundNames, category: AllowedSoundCategories }[] =
    [
      {name: 'heavy rain loop', category: 'water'},
      {name: 'heavy rain window loop', category: 'water'},
      {name: 'ocean waves', category: 'water'},
      {name: "crackling fireplace", category: 'fire'}
    ]

  const object: Sounds = {} as Sounds;
  for (const sound of soundNames) {
    const audio = await useGetAudioForSereneSounds(sound.name);
    if (audio instanceof Error) {
      return;
    }

    object[sound.name] = {
      category: sound.category,
      audio: audio
    }
  }

  return object;
}
