<script setup lang="ts">
import type { Playlist } from '@/types/AudioPlayerTypes.ts';

const { playlist } = defineProps<{ playlist: Playlist }>();

const emit = defineEmits(['openPlaylist']);
</script>
<template>
  <li class="audio-player-playlist-list-item">
    <button @click="emit('openPlaylist')" class="playlist-name">{{ playlist.name }}</button>
  </li>
</template>
<style scoped>
li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  min-height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 10px;
}

.button-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

button {
  cursor: pointer;
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-primary-color);
  border: none;
  border-radius: 100%;
  width: 35px;
  height: 35px;
}

.playlist-name {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-color);
  text-decoration: underline;
  font-size: var(--font-size-lg);
}

.playlist-name:hover {
  text-decoration: underline;
}
</style>
