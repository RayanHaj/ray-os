import type { AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

export async function useGetAudioForSereneSounds(
  name: AllowedSoundNames,
): Promise<HTMLAudioElement | Error> {
  return new Promise((resolve, reject) => {
    const soundName = name.endsWith('.mp3') ? name : `${name}.mp3`;
    const path = new URL(`../assets/sounds/sereneSounds/${soundName}`, import.meta.url).href;
    const audio = new Audio(path);

    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener(
      'error',
      () => reject(new Error('could not find audio with given name')),
      { once: true },
    );
  });
}
