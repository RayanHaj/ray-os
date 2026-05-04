import { defineStore } from 'pinia';
import type { AudioPlayerPage } from '@/types/AudioPlayerTypes.ts';
import  { ref, type Ref } from 'vue';

export const useAudioPlayerStore = defineStore('audioPlayer', () => {
  const selectedPage: Ref<AudioPlayerPage> = ref('Home');

  return { selectedPage }
});
