import type { AllowedSoundCategories, AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

export type Sounds = { [name in AllowedSoundNames]: SoundProperties };

export type SoundProperties = { category: AllowedSoundCategories; audio: HTMLAudioElement };
