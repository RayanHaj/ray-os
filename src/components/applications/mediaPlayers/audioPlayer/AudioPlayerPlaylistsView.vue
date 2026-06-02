<script setup lang="ts">
import AudioPlayerPlaylistListItem from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerPlaylistListItem.vue';
import type { Playlist } from '@/types/AudioPlayerTypes.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';

const { loadedPlaylists } = defineProps<{ loadedPlaylists: Playlist[] }>();

const emit = defineEmits(['onCreateNewPlaylistClicked', 'onOpenPlaylist', 'onDeletePlaylist']);

function onContextmenu(event: MouseEvent, playlist: Playlist) {
  useInitializeContextMenu(event)
    .audioPlayerPlaylist()
    .initialize({}, { deletePlaylist: () => emit('onDeletePlaylist', playlist.id) });
}
</script>
<template>
  <button class="add-audio-button" @click="emit('onCreateNewPlaylistClicked')">
    Create new playlist
  </button>
  <ul>
    <AudioPlayerPlaylistListItem
      v-for="playlist in loadedPlaylists"
      :key="playlist.id"
      :playlist="playlist"
      @open-playlist="emit('onOpenPlaylist', playlist)"
      @contextmenu.prevent="onContextmenu($event, playlist)"
    />
  </ul>
</template>
<style scoped>
ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
  overflow: auto;
}

button {
  font-size: var(--font-size-lg);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  padding-block: 5px;
  padding-inline: 10px;
  width: 100%;
  height: 50px;
  min-height: 50px;
}
</style>
