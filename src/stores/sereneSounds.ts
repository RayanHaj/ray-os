import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import type { Sounds } from '@/types/Sounds.ts';

export const useSereneSoundsStore = defineStore('sereneSounds', () => {
  const sounds = ref<Sounds>({} as Sounds);

  async function playSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (!audio.paused) {
      return;
    }

    await audio.play();
  }

  function pauseSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (audio.paused) {
      return;
    }

    audio.pause();
  }

  function pauseAllSounds() {
    const soundNames = Object.keys(sounds.value) as AllowedSoundNames[];
    for (const soundName of soundNames) {
      const audio = sounds.value[soundName].audio;
      audio.currentTime = 0;
      if (audio.paused) {
        return;
      }

      audio.pause();
    }
  }

  return { sounds, playSound, pauseSound, pauseAllSounds }
});
