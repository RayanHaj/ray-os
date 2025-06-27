import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';
import type { Sounds } from '@/types/SoundTypes.ts';
import { useGetInitialSounds } from '@/composables/useGetInitialSounds.ts';

export const useSereneSoundsStore = defineStore('sereneSounds', () => {
  const sounds = ref<Sounds>({} as Sounds);
  const playingSounds = ref<AllowedSoundNames[]>([]);

  async function initializeSounds() {
    if (Object.keys(sounds.value).length === 0) {
      const initSounds = await useGetInitialSounds();
      if (initSounds) {
        sounds.value = initSounds;
      }
    }
  }

  async function playSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (!audio.paused) {
      return;
    }

    playingSounds.value = [...playingSounds.value, soundName];
    audio.loop = true;
    await audio.play();
  }

  function pauseSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (audio.paused) {
      return;
    }

    playingSounds.value = playingSounds.value.filter((sound) => sound !== soundName);
    audio.pause();
  }

  function pauseAllSounds() {
    playingSounds.value = [];

    const soundNames = Object.keys(sounds.value) as AllowedSoundNames[];
    for (const soundName of soundNames) {
      const audio = sounds.value[soundName].audio;
      audio.currentTime = 0;
      audio.pause();
    }
  }

  function adjustVolume(soundName: AllowedSoundNames, volumeLevel: number) {
    sounds.value[soundName].audio.volume = volumeLevel;
  }

  return {
    initializeSounds,
    sounds,
    playingSounds,
    playSound,
    pauseSound,
    pauseAllSounds,
    adjustVolume,
  };
});
