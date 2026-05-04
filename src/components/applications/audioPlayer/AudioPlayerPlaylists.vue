<script setup lang="ts">
import AudioPlayerPlaylist from '@/components/applications/audioPlayer/AudioPlayerPlaylist.vue';
import type { Playlist } from '@/types/AudioPlayerTypes.ts';

const mockPlaylists: Playlist[] = [
  { id: 0, name: 'test1', audios: [] },
  { id: 1, name: 'test2', audios: [] },
  { id: 2, name: 'test3', audios: [] },
];
</script>
<template>
  <div class="audio-player-playlists">
    <h2>Playlists</h2>
    <div class="playlists-view">
      <AudioPlayerPlaylist
        v-for="playlist in mockPlaylists"
        :key="playlist.id"
        :playlist="playlist"
      />
    </div>
  </div>
</template>
<style scoped>
.audio-player-playlists {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  gap: 10px;
  color: var(--text-color);
}

.playlists-view {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
