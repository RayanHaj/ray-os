<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { nextTick, onMounted, onUnmounted, ref, type Ref, useTemplateRef, watch } from 'vue';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import type { LoadedVideo } from '@/types/videoPlayerTypes.js';
import MediaPlayerFooter from '@/components/applications/mediaPlayers/MediaPlayerFooter.vue';
import FileSelectButton from '@/components/applications/mediaPlayers/FileSelectButton.vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import { useRequestFullscreenVideo } from '@/composables/videoPlayer/useRequestFullscreenVideo.ts';

const videoPlayerStore = useVideoPlayerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedVideo: Ref<LoadedVideo> = ref({ windowId: null, file: null });
const videoUrl: Ref<string | null> = ref(null);

const videoPlayerRef = useTemplateRef('videoPlayerRef');
const videoRef = useTemplateRef('videoRef');
const videoContentRef = useTemplateRef('videoContentRef');

const videoDuration = ref(0);
const videoCurrentTime = ref(0);
const videoIsPlaying = ref(false);
const videoLoop = ref(false);

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.loop = videoLoop.value;
    videoRef.value.addEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.addEventListener('timeupdate', onTimeUpdate);
    videoRef.value.addEventListener('ended', onAudioEnded);
  }
});

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.removeEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.removeEventListener('timeupdate', onTimeUpdate);
    videoRef.value.removeEventListener('ended', onAudioEnded);
    videoRef.value.src = '';
  }

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }

  videoPlayerStore.removeLoadedVideo(windowId);
});

watch(
  () => videoPlayerStore.loadedVideo,
  async (newLoadedVideo) => {
    if (newLoadedVideo.windowId !== windowId) return;

    loadedVideo.value = newLoadedVideo;
    if (loadedVideo.value.file) {
      videoUrl.value = URL.createObjectURL(loadedVideo.value.file);
    }

    await nextTick();

    if (videoRef.value) {
      videoRef.value.loop = videoLoop.value;
      videoRef.value.addEventListener('loadedmetadata', updateAudioDuration);
      videoRef.value.addEventListener('timeupdate', onTimeUpdate);
      videoRef.value.addEventListener('ended', onAudioEnded);
    }
  },
  { immediate: true },
);

watch(videoLoop, (newValue, oldValue) => {
  if (newValue === oldValue) return;
  if (!videoRef.value) return;

  videoRef.value.loop = newValue;
});

function updateAudioDuration() {
  videoDuration.value = videoRef.value?.duration ?? 0;
}

function onTimeUpdate() {
  videoCurrentTime.value = videoRef.value?.currentTime ?? 0;

  if (Math.floor(videoDuration.value) === Math.floor(videoCurrentTime.value) && videoRef.value) {
    if (videoLoop.value) {
      videoCurrentTime.value = 0;
      videoRef.value.currentTime = 0;
    }
    return;
  }
}

function onAudioEnded() {
  if (!videoRef.value || videoLoop.value) return;

  videoCurrentTime.value = 0;
  videoRef.value.currentTime = 0;
  pauseVideo();
}

function playVideo() {
  if (!videoRef.value) return;

  videoRef.value.play();
  videoIsPlaying.value = true;
}

function pauseVideo() {
  if (!videoRef.value) return;

  videoRef.value.pause();
  videoIsPlaying.value = false;
}

function onSliderInput(time: number) {
  if (videoRef.value) videoRef.value.currentTime = time;
}

function onFileSelectReturnValue(returnValue: { windowId: string; value: FileSelectReturnItem[] }) {
  for (const value of returnValue.value) {
    if (!value.fileItem.rawFile) return;

    videoPlayerStore.initVideoFileAndUrl(windowId, value.fileItem.rawFile);
  }
}
</script>
<template>
  <div class="video-player" ref="videoPlayerRef">
    <div class="video-content" ref="videoContentRef">
      <video v-if="videoUrl" ref="videoRef" :src="videoUrl"/>
      <FileSelectButton
        v-else
        :window-id="windowId"
        :allowed-file-types="['video/mp4']"
        @return-value="onFileSelectReturnValue"
      >video file</FileSelectButton
      >
    </div>
    <MediaPlayerFooter
      :file-name="loadedVideo.file?.name ?? ''"
      :audio-duration="videoDuration"
      :audio-current-time="videoCurrentTime"
      :is-playing="videoIsPlaying"
      :looped="videoLoop"
      :disabled="false"
      :options="{ nextAndPrevious: false, shuffle: false, fullscreen: true }"
      @play-pause-audio="videoIsPlaying ? pauseVideo() : playVideo()"
      @slider-input="onSliderInput"
      @loop-audio="videoLoop = !videoLoop"
      @fullscreen="useRequestFullscreenVideo(videoPlayerRef)"
    />
  </div>
</template>
<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;

  --audio-player-footer-height: 80px;
}

.video-content {
  width: 100%;
  height: calc(100% - var(--audio-player-footer-height));
  background-color: black;
}

.video-content video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
