<script setup lang="ts">
import AudioPlayerListItem from '@/components/applications/audioPlayer/AudioPlayerListItem.vue';
import type { AudioPlayerPages } from '@/types/AudioPlayerTypes.ts';

const { currentPage } = defineProps<{ currentPage: AudioPlayerPages }>();
</script>
<template>
  <ul v-if="currentPage === 'playlist'">
    <AudioPlayerListItem
      v-for="(loadedAudio, index) in loadedAudios"
      :key="loadedAudio.audioUrl"
      :file-name="loadedAudio.file?.name ?? ''"
      :is-playing="loadedAudio.isPlaying ?? false"
      @play-pause-audio="
        loadedAudios[index].isPlaying ? pauseAudio() : playAudio(loadedAudio.audioUrl)
      "
      @remove-audio-from-list="removeAudioFromList(index)"
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
</style>
