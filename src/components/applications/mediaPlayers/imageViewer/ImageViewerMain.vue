<script setup lang="ts">
import { onUnmounted, ref, type Ref, watchEffect } from 'vue';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';

const imageViewerStore = useImageViewerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedImage: Ref<LoadedImage> = ref({ windowId: null, file: null });
const imageUrl: Ref<string | null> = ref(null);

watchEffect(() => {
  if (imageViewerStore.loadedImage.windowId !== windowId) {
    return;
  }

  loadedImage.value = imageViewerStore.loadedImage;
  if (imageViewerStore.loadedImage.file) {
    imageUrl.value = URL.createObjectURL(imageViewerStore.loadedImage.file);
  }
});

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<template>
  <div class="image-viewer">
    <img :src="imageUrl ?? undefined" :alt="loadedImage.file?.name" />
  </div>
</template>

<style scoped>
.image-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-viewer img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
