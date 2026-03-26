<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { onUnmounted, ref, type Ref, watchEffect } from 'vue';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';

const videoPlayerStore = useVideoPlayerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedVideo: Ref<LoadedImage> = ref({ windowId: null, file: null });
const videoUrl: Ref<string | null> = ref(null);

watchEffect(() => {
  if (videoPlayerStore.loadedVideo.windowId !== windowId) {
    return;
  }

  loadedVideo.value = videoPlayerStore.loadedVideo;
  if (videoPlayerStore.loadedVideo.file) {
    videoUrl.value = URL.createObjectURL(videoPlayerStore.loadedVideo.file);
  }
});

onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});
</script>
<template>
  <div class="video-player">
    <video :src="videoUrl ?? undefined" controls />
  </div>
</template>
<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-player video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
