import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';

export type Sounds = {
  [name in AllowedSoundNames]: SoundProperties
}

export type SoundProperties = {
  category: AllowedSoundCategories,
  audio: HTMLAudioElement
}
