import type { SoundProperties, Sounds } from '@/types/SoundTypes.ts';
import type { AllowedSoundCategories, AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

export function useFilterSoundsByCategory(sounds: Sounds, category: AllowedSoundCategories) {
  return Object.fromEntries(
    Object.entries(sounds).filter(([_, properties]) => properties.category === category) as [
      AllowedSoundNames,
      SoundProperties,
    ][],
  ) as Sounds;
}
