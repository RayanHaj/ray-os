import type { AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

export async function useGetAudioForSereneSounds(
  name: AllowedSoundNames,
): Promise<HTMLAudioElement | Error> {
  return new Promise((resolve, reject) => {
    const soundName = name.endsWith('.mp3') ? name : `${name}.mp3`;
    const audio = new Audio(`/sounds/sereneSounds/${soundName}`);

    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener(
      'error',
      () => reject(new Error('could not find audio with given name')),
      { once: true },
    );
  });
}
