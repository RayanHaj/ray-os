<script setup lang="ts">
import { computed, onUnmounted, ref, type Ref, watch } from 'vue';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

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

watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (returnValues) => {
    const returnValue = returnValues.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!returnValue || !fileExplorerWindowId.value) return;

    for (const value of returnValue.value) {
      if (!value.fileItem.rawFile) return;

      imageViewerStore.initImageFileAndUrl(windowId, value.fileItem.rawFile);
    }

    useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
  },
);

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }

  imageViewerStore.removeLoadedImage(windowId);
});

const fileExplorerWindowId = ref<string>();
function handleSelectTextFile() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(
    windowId,
    nextFileExplorerId,
    ['image/jpeg', 'image/png', 'image/webp'],
    false,
  );

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

const fileExplorerWindowIsOpen = computed(() =>
  useWindowStore().openWindowsReferences['File Explorer']?.some(
    (reference) =>
      useWindowStore().getWindowId('File Explorer', reference.id) === fileExplorerWindowId.value,
  ),
);
</script>

<template>
  <div v-if="imageUrl" class="image-viewer">
    <img :src="imageUrl" :alt="loadedImage.file?.name" />
  </div>
  <div v-else class="select-text-file">
    <div class="select-text-file-wrapper">
      <button @click="handleSelectTextFile" :disabled="fileExplorerWindowIsOpen">
        <span>
          <component :is="useSvgOrFallback('Upload').svg" />
          Click to select a text file
        </span>
      </button>
    </div>
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

.select-text-file {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  max-height: calc(100% - var(--notepad-header-height));
  height: 100%;
  overflow: hidden;
}

.select-text-file {
  justify-self: start;
}

.select-text-file-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.select-text-file-wrapper button {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: rgb(0, 0, 0, 0.5);
  font-size: var(--font-size-elg);
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.select-text-file-wrapper span {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
}

.select-text-file-wrapper svg {
  width: 50px;
  height: 50px;
}
</style>
