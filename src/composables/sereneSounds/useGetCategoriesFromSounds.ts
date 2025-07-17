import type { Sounds } from '@/types/SoundTypes.ts';
import type { AllowedSoundCategories } from '@/types/SereneSoundsTypes.ts';

export function useGetCategoriesFromSounds(sounds: Sounds) {
  return Object.entries(sounds).reduce((accumulator, value) => {
    const [_, properties] = value;
    if (!accumulator.includes(properties.category)) {
      accumulator.push(properties.category);
    }

    return accumulator;
  }, [] as AllowedSoundCategories[]);
}
