import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import { isVideoType } from '@/types/itemTypes.ts';
import type { LoadedVideo } from '@/types/videoPlayerTypes.ts';

export const useVideoPlayerStore = defineStore('videoPlayer', () => {
  const loadedVideo: Ref<LoadedVideo> = ref({ windowId: null, file: null });
  const hasOpenInstance: Ref<boolean> = ref(false);

  function initVideoFileAndUrl(windowId: string, videoFile: File): boolean {
    if (!isVideoType(videoFile.type)) {
      return false;
    }

    loadedVideo.value = { windowId: windowId, file: videoFile };
    return true;
  }

  function removeLoadedVideo(windowId: string) {
    if (loadedVideo.value.windowId === windowId) {
      loadedVideo.value = { windowId: null, file: null };
    }
  }

  return { loadedVideo, initVideoFileAndUrl, removeLoadedVideo, hasOpenInstance };
});
