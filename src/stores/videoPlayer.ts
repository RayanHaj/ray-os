import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import { isVideoType } from '@/types/ItemTypes.ts';
import type { LoadedVideo } from '@/types/VideoPlayerTypes.ts';

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

  return { loadedVideo, initVideoFileAndUrl, hasOpenInstance };
});
