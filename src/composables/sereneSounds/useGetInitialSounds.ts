import type { Sounds } from '@/types/SoundTypes.ts';
import { useGetAudioForSereneSounds } from '@/composables/sereneSounds/useGetAudioForSereneSounds.ts';
import type { AllowedSoundCategories, AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

export async function useGetInitialSounds() {
  const soundNames: { name: AllowedSoundNames; category: AllowedSoundCategories }[] = [
    { name: 'heavy rain loop', category: 'water' },
    { name: 'heavy rain window loop', category: 'water' },
    { name: 'ocean waves', category: 'water' },
    { name: 'crackling fireplace', category: 'fire' },
  ];

  const object: Sounds = {} as Sounds;
  for (const sound of soundNames) {
    const audio = await useGetAudioForSereneSounds(sound.name);
    if (audio instanceof Error) {
      return;
    }

    object[sound.name] = { category: sound.category, audio: audio };
  }

  return object;
}
