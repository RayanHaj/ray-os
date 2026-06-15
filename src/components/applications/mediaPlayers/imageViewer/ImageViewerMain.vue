<script setup lang="ts">
import { onUnmounted, ref, type Ref, watch } from 'vue';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';
import FileSelectButton from '@/components/applications/mediaPlayers/FileSelectButton.vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';

const imageViewerStore = useImageViewerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedImage: Ref<LoadedImage> = ref({ windowId: null, file: null });
const imageUrl: Ref<string | null> = ref(null);

watch(
  () => imageViewerStore.loadedImage,
  (newImage) => {
    if (newImage.windowId !== windowId) return;

    loadedImage.value = newImage;
    if (loadedImage.value.file) {
      imageUrl.value = URL.createObjectURL(loadedImage.value.file);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }

  imageViewerStore.removeLoadedImage(windowId);
});

function onFileSelectReturnValue(returnValue: { windowId: string; value: FileSelectReturnItem[] }) {
  for (const value of returnValue.value) {
    if (!value.fileItem.rawFile) return;

    imageViewerStore.initImageFileAndUrl(windowId, value.fileItem.rawFile);
  }
}
</script>

<template>
  <div v-if="imageUrl" class="image-viewer">
    <img :src="imageUrl" :alt="loadedImage.file?.name" />
  </div>
  <FileSelectButton
    v-else
    :window-id="windowId"
    :allowed-file-types="['image/jpeg', 'image/png', 'image/webp']"
    @return-value="onFileSelectReturnValue"
    >image file</FileSelectButton
  >
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
