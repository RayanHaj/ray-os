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

  return { loadedImage, initImageFileAndUrl, hasOpenInstance };
});
