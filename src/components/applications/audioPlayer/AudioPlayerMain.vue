<script setup lang="ts">
// import AudioPlayerPlaylists from '@/components/applications/audioPlayer/AudioPlayerPlaylists.vue';

import { onUnmounted, type Ref, ref, watch, watchEffect } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';

const audioPlayerStore = useAudioPlayerStore();

const windowId = useInjectOrThrow<string>('windowId');

const loadedAudio: Ref<LoadedImage> = ref({ windowId: null, file: null });
const audioUrl: Ref<string | null> = ref(null);

watchEffect(() => {
  if (audioPlayerStore.loadedAudio.windowId !== windowId) {
    return;
  }

  loadedAudio.value = audioPlayerStore.loadedAudio;
  if (audioPlayerStore.loadedAudio.file) {
    audioUrl.value = URL.createObjectURL(audioPlayerStore.loadedAudio.file);
  }
});

const audioElementRef = ref();
watch(
  [audioElementRef, audioUrl],
  () => {
    if (audioElementRef.value instanceof HTMLAudioElement && loadedAudio.value.file) {
      audioPlayerStore.setAudioElement(windowId, audioElementRef.value, loadedAudio.value.file);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>
<template>
  <div class="audio-player">
    <div class="content">
      {{ loadedAudio.file?.name ?? 'load audio through File Explorer' }}
      <audio ref="audioElementRef" :src="audioUrl ?? undefined" controls loop></audio>
    </div>
  </div>
</template>
<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  --audio-player-header-height: 50px;
  color: var(--text-color);
}

.content {
  display: flex;
  gap: 5px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - var(--audio-player-header-height));
}
</style>
