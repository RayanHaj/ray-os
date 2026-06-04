import { defineStore } from 'pinia';
import { type Ref, ref } from 'vue';
import { isImageType } from '@/types/itemTypes.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';

export const useImageViewerStore = defineStore('imageViewer', () => {
  const loadedImage: Ref<LoadedImage> = ref({
    windowId: null,
    file: null,
  });
  const hasOpenInstance: Ref<boolean> = ref(false);

  function initImageFileAndUrl(windowId: string, imageFile: File): boolean {
    if (!isImageType(imageFile.type)) {
      return false;
    }

    loadedImage.value = { windowId: windowId, file: imageFile };
    return true;
  }

  function removeLoadedImage(windowId: string) {
    if (loadedImage.value.windowId === windowId) {
      loadedImage.value = { windowId: null, file: null };
    }
  }

  return { loadedImage, initImageFileAndUrl, removeLoadedImage, hasOpenInstance };
});
