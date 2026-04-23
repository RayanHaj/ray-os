import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import type { LoadedImage } from '@/types/imageViewerTypes.ts';
import { isVideoType } from '@/types/ItemTypes.ts';

export const useVideoPlayerStore = defineStore('videoPlayer', () => {
  const loadedVideo: Ref<LoadedImage> = ref({ windowId: null, file: null });
  const hasOpenInstance: Ref<boolean> = ref(false);

  function initVideoFileAndUrl(windowId: string, videoFile: File): boolean {
    if (!isVideoType(videoFile.type)) {
      return false;
    }

    loadedVideo.value = { windowId: windowId, file: videoFile };
    return true;
  }

  return { loadedVideo, initVideoFileAndUrl, hasOpenInstance };
});
