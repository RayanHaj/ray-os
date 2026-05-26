<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { onMounted, onUnmounted, ref, type Ref, watch, watchEffect } from 'vue';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import type { LoadedVideo } from '@/types/VideoPlayerTypes.ts';
import MediaPlayerFooter from '@/components/applications/mediaPlayers/MediaPlayerFooter.vue';

const videoPlayerStore = useVideoPlayerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedVideo: Ref<LoadedVideo> = ref({ windowId: null, file: null });
const videoUrl: Ref<string | null> = ref(null);

const videoRef = ref<HTMLVideoElement | null>();

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
    videoRef.value = null;

    videoPlayerStore.removeLoadedVideo(windowId);
  }

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});

watchEffect(() => {
  if (videoPlayerStore.loadedVideo.windowId !== windowId) {
    return;
  }

  loadedVideo.value = videoPlayerStore.loadedVideo;
  if (videoPlayerStore.loadedVideo.file) {
    videoUrl.value = URL.createObjectURL(videoPlayerStore.loadedVideo.file);
  }
});

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
</script>
<template>
  <div class="video-player">
    <video
      ref="videoRef"
      :src="videoUrl ?? undefined"
    />
    <MediaPlayerFooter
      :file-name="loadedVideo.file?.name ?? ''"
      :audio-duration="videoDuration"
      :audio-current-time="videoCurrentTime"
      :is-playing="videoIsPlaying"
      :looped="videoLoop"
      :disabled="false"
      :options="{ dotMenu: true }"
      @play-pause-audio="videoIsPlaying ? pauseVideo() : playVideo()"
      @slider-input="onSliderInput"
      @loop-audio="videoLoop = !videoLoop"
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
  justify-content: center;
  overflow: hidden;
  color: var(--text-color);

  --audio-player-header-height: 50px;
  --audio-player-footer-height: 80px;
}

.video-player video {
  width: 100%;
  max-width: 100%;
  max-height: calc(100% - var(--audio-player-footer-height));
  object-fit: contain;
}
</style>
