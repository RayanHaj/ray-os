<script setup lang="ts">
import { type AudioPlayerPage, audioPlayerPages } from '@/types/AudioPlayerTypes.ts';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';

const audioPlayerStore = useAudioPlayerStore();
function setSelectedPage(page: AudioPlayerPage) {
  audioPlayerStore.selectedPage = page;
}
</script>
<template>
  <div class="video-player-header">
    <ul>
      <li v-for="page in audioPlayerPages" :key="page">
        <button @click="setSelectedPage(page)">{{ page }}</button>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.video-player-header {
  width: 100%;
  height: var(--audio-player-header-height);
}
ul {
  display: flex;
  flex-direction: row;
  list-style-type: none;
  gap: 5px;
}
li {
}
</style>
