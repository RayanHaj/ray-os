import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';

export type Sounds = {
  [name in AllowedSoundNames]: {
    type: string,
    audio: HTMLAudioElement
  }
}
