import type { SoundProperties, Sounds } from '@/types/Sounds.ts';
import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';

export function useFilterSoundsByCategory(sounds: Sounds, category: AllowedSoundCategories) {
  return Object.fromEntries(
    Object.entries(sounds).filter(([_, properties]) => properties.category === category) as [
      AllowedSoundNames,
      SoundProperties,
    ][],
  ) as Sounds;
}
