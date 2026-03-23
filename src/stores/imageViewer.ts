import { defineStore } from 'pinia';
import { type Ref, ref } from 'vue';
import { isImageType } from '@/types/ItemTypes.ts';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';

export const useImageViewerStore = defineStore('imageViewer', () => {
  const loadedImage: Ref<LoadedImage> = ref({
    windowId: null,
    file: null,
  });

  function initImageFileAndUrl(windowId: string, imageFile: File): boolean {
    if (!isImageType(imageFile.type)) {
      return false;
    }

    loadedImage.value = { windowId: windowId, file: imageFile };
    return true;
  }

  return { loadedImage, initImageFileAndUrl };
});
