import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import type { Sounds } from '@/types/Sounds.ts';

export const useSereneSoundsStore = defineStore('sereneSounds', () => {
  const sounds = ref<Sounds>({} as Sounds);
  const playingSounds = ref<AllowedSoundNames[]>([]);

  async function playSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (!audio.paused) {
      return;
    }

    playingSounds.value = [...playingSounds.value, soundName];
    await audio.play();
  }

  function pauseSound(soundName: AllowedSoundNames) {
    const audio = sounds.value[soundName].audio;
    if (audio.paused) {
      return;
    }

    playingSounds.value = playingSounds.value.filter(sound => sound !== soundName);
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

  return { sounds, playingSounds, playSound, pauseSound, pauseAllSounds }
});
