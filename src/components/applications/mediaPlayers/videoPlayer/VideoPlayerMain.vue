<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { nextTick, onMounted, onUnmounted, reactive, useTemplateRef, watch } from 'vue';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import { createVideo, type Video } from '@/types/videoPlayerTypes.js';
import MediaPlayerFooter from '@/components/applications/mediaPlayers/MediaPlayerFooter.vue';
import FileSelectButton from '@/components/applications/mediaPlayers/FileSelectButton.vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import { useRequestFullscreenVideo } from '@/composables/videoPlayer/useRequestFullscreenVideo.ts';

const video = reactive<Video>(createVideo());

const windowId = useInjectOrThrow<string>('windowId');
const videoPlayerStore = useVideoPlayerStore();

const videoRef = useTemplateRef('videoRef');
const videoPlayerRef = useTemplateRef('videoPlayerRef');

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.loop = video.looped;
    videoRef.value.addEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.addEventListener('timeupdate', updateAudioTime);
    videoRef.value.addEventListener('ended', onAudioEnded);
    playVideo();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        video.isPlaying = true;
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        video.isPlaying = false;
      });
    }
  }
});

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.removeEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.removeEventListener('timeupdate', updateAudioTime);
    videoRef.value.removeEventListener('ended', onAudioEnded);
    videoRef.value.src = '';
  }

  if (video.url) URL.revokeObjectURL(video.url);

  videoPlayerStore.removeLoadedVideo(windowId);
});

watch(
  () => videoPlayerStore.loadedVideo,
  async (newLoadedVideo) => {
    if (newLoadedVideo.windowId !== windowId) return;

    video.videoFile = newLoadedVideo.file;

    if (video.videoFile) {
      video.url = URL.createObjectURL(video.videoFile);
    }

    await nextTick();

    if (videoRef.value) {
      videoRef.value.loop = video.looped;
      videoRef.value.addEventListener('loadedmetadata', updateAudioDuration);
      videoRef.value.addEventListener('timeupdate', updateAudioTime);
      videoRef.value.addEventListener('ended', onAudioEnded);
    }
  },
  { immediate: true },
);

watch(
  () => video.looped,
  (newValue) => (videoRef.value ? (videoRef.value.loop = newValue) : undefined),
);

const updateAudioDuration = () => (video.duration = videoRef.value?.duration ?? 0);
const updateAudioTime = () => {
  video.currentTime = videoRef.value?.currentTime ?? 0;

  if (Math.floor(video.duration) === Math.floor(video.currentTime) && videoRef.value) {
    if (video.looped) {
      video.currentTime = 0;
      videoRef.value.currentTime = 0;
    }
    return;
  }
};

const onAudioEnded = () => {
  if (!videoRef.value || video.looped) return;

  video.currentTime = 0;
  videoRef.value.currentTime = 0;
  pauseVideo();
};

const playVideo = () => {
  if (!videoRef.value) return;

  videoRef.value.play();
  video.isPlaying = true;
};

const pauseVideo = () => {
  if (!videoRef.value) return;

  videoRef.value.pause();
  video.isPlaying = false;
};

const onSliderInput = (time: number) =>
  videoRef.value ? (videoRef.value.currentTime = time) : undefined;

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
      <video v-if="video.url" ref="videoRef" :src="video.url" disablePictureInPicture />
      <FileSelectButton
        v-else
        :window-id="windowId"
        :allowed-file-types="['video/mp4']"
        @return-value="onFileSelectReturnValue"
        >video file</FileSelectButton
      >
    </div>
    <MediaPlayerFooter
      :file-name="video.videoFile?.name ?? ''"
      :audio-duration="video.duration"
      :audio-current-time="video.currentTime"
      :is-playing="video.isPlaying"
      :looped="video.looped"
      :disabled="false"
      :options="{ nextAndPrevious: false, shuffle: false, fullscreen: true }"
      @play-pause-audio="video.isPlaying ? pauseVideo() : playVideo()"
      @slider-input="onSliderInput"
      @loop-audio="video.looped = !video.looped"
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
  cursor: auto;
}

.video-content video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
