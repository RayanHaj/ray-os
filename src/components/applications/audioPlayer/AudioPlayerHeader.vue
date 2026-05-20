<script setup lang="ts">
import { ref, watch } from 'vue';

const { _playlistName } = defineProps<{ _playlistName?: string }>();

const playlistName = ref('');
watch(
  () => _playlistName,
  (newPlaylistName, oldPlaylistName) => {
    if (!newPlaylistName || newPlaylistName === oldPlaylistName) return;
    playlistName.value = newPlaylistName;
  },
  { immediate: true },
);

const emit = defineEmits(['savePlaylist']);

function onPlaylistNameInput(event: InputEvent) {
  playlistName.value = (event.target as HTMLInputElement).value;
}
function onFileNameBlur(event: FocusEvent) {
  (event.target as HTMLParagraphElement).scrollLeft = 0;
}
</script>

<template>
  <div class="notepad-header">
    <input
      class="file-name"
      contenteditable="true"
      @input="onPlaylistNameInput($event as InputEvent)"
      @blur="onFileNameBlur($event as FocusEvent)"
      :value="playlistName"
    />
    <div class="buttons">
      <button class="button">playlists</button>
      <button @click="emit('savePlaylist', playlistName)" class="button">save playlist</button>
    </div>
  </div>
</template>

<style scoped>
.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 10px;
  width: 100%;
  height: var(--audio-player-header-height);
  background-color: var(--taskbar-background-color);
  color: var(--text-color);
}

.playlist-name-wrapper {
  display: flex;
  flex-direction: row;
}

.file-name {
  font-size: var(--font-size-elg);
  background-color: var(--input-primary-color);
  color: var(--text-color);
  border: var(--input-border-color) 2px solid;
  padding-inline: 10px;
  padding-block: 3px;
  border-radius: 5px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-name:focus {
  overflow-x: auto;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  border-radius: 5px;
  color: var(--text-color);
  padding-block: 5px;
  padding-inline: 10px;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.button:hover {
  border-color: var(--button-hover-color);
  background-color: var(--button-hover-color);
}

@container audioPlayer (max-width: 550px) {
  .notepad-header {
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    height: var(--audio-player-header-column-height);
  }

  .button,
  .buttons {
    width: 100%;
  }

  .file-name {
    width: 100%;
  }
}
</style>
