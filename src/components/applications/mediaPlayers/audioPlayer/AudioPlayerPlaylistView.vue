<script setup lang="ts">
import AudioPlayerListItem from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerListItem.vue';
import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';
import { useSpliceFileNameExtension } from '@/composables/helpers/useSpliceFileNameExtension.ts';

const { loadedAudios } = defineProps<{ loadedAudios: LoadedAudio[] }>();

const emit = defineEmits(['addAudioButtonClicked', 'onPlayPauseAudio', 'onRemoveAudio']);
</script>
<template>
  <button class="add-audio-button" @click="emit('addAudioButtonClicked')">
    Add audio to playlist
  </button>
  <ul>
    <AudioPlayerListItem
      v-for="(loadedAudio, index) in loadedAudios"
      :key="loadedAudio.audioUrl"
      :file-name="useSpliceFileNameExtension(loadedAudio.file?.name ?? '')"
      :is-playing="loadedAudio.isPlaying ?? false"
      @play-pause-audio="
        emit('onPlayPauseAudio', loadedAudios[index].isPlaying, loadedAudio.audioUrl)
      "
      @remove-audio-from-list="emit('onRemoveAudio', index)"
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
  color: var(--text-color);
  padding-block: 5px;
  padding-inline: 10px;
  width: 100%;
  height: 50px;
  min-height: 50px;
}
</style>
