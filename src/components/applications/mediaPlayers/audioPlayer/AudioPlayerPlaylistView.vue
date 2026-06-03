<script setup lang="ts">
import AudioPlayerListItem from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerListItem.vue';
import type { LoadedAudio } from '@/types/audioPlayerTypes.js';
import { useSpliceFileNameExtension } from '@/composables/helpers/useSpliceFileNameExtension.ts';
import { ref, useTemplateRef, watch } from 'vue';

const { loadedAudios, currentLoadedAudioUrl } = defineProps<{
  loadedAudios: LoadedAudio[];
  currentLoadedAudioUrl: string | undefined;
}>();

const emit = defineEmits(['addAudioButtonClicked', 'onPlayPauseAudio', 'onRemoveAudio']);

const currentFocusedAudioUrl = ref<string | undefined>();

const audioPlayerListItem = useTemplateRef('audioPlayerListItem');
const playlistViewRef = useTemplateRef('playlistViewRef');

watch(
  () => loadedAudios,
  (newLoadedAudios) => {
    if (!currentLoadedAudioUrl) return;

    const newAudio = newLoadedAudios.find((audio) => audio.audioUrl === currentLoadedAudioUrl);
    if (newAudio?.isPlaying && currentFocusedAudioUrl.value !== currentLoadedAudioUrl) {
      const newAudioIndex = newLoadedAudios.findIndex(
        (audio) => audio.audioUrl === currentLoadedAudioUrl,
      );

      if (audioPlayerListItem.value) {
        const audioPlayerListItemElement = audioPlayerListItem.value.map(
          (instance) => instance?.audioPlayerListItemRef,
        )[newAudioIndex];
        if (!audioPlayerListItemElement) return;

        const audioPlayerListItemRect = audioPlayerListItemElement.getBoundingClientRect();
        const playlistViewRect = playlistViewRef.value?.getBoundingClientRect();

        if (!playlistViewRect) return;

        const isVisible =
          audioPlayerListItemRect.top >= playlistViewRect.top &&
          audioPlayerListItemRect.bottom <= playlistViewRect.bottom;

        if (isVisible) return;

        audioPlayerListItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  },
  { deep: true, immediate: true },
);
</script>
<template>
  <button class="add-audio-button" @click="emit('addAudioButtonClicked')">
    Add audio to playlist
  </button>
  <ul ref="playlistViewRef">
    <AudioPlayerListItem
      v-for="(loadedAudio, index) in loadedAudios"
      ref="audioPlayerListItem"
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
  padding-block: 5px;
  padding-inline: 10px;
  width: 100%;
  height: 50px;
  min-height: 50px;
}
</style>
