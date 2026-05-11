<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { onMounted, onUnmounted, ref, type Ref, watchEffect } from 'vue';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import type { LoadedVideo } from '@/types/VideoPlayerTypes.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';

const videoPlayerStore = useVideoPlayerStore();
const windowId = useInjectOrThrow<string>('windowId');

const loadedVideo: Ref<LoadedVideo> = ref({ windowId: null, file: null });
const videoUrl: Ref<string | null> = ref(null);

const videoRef = ref<HTMLVideoElement | null>();

const videoDuration = ref(0);
const videoCurrentTime = ref(0);
const videoIsPlaying = ref(false);

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.addEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.addEventListener('timeupdate', onTimeUpdate);
  }
});

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.removeEventListener('loadedmetadata', updateAudioDuration);
    videoRef.value.removeEventListener('timeupdate', onTimeUpdate);
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

function updateAudioDuration() {
  videoDuration.value = videoRef.value?.duration ?? 0;
}

function onTimeUpdate() {
  if (Math.floor(videoDuration.value) === Math.floor(videoCurrentTime.value) && videoRef.value) {
    videoCurrentTime.value = 0;
    videoRef.value.currentTime = 0;
    return;
  }

  videoCurrentTime.value = videoRef.value?.currentTime ?? 0;
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
    <video ref="videoRef" :src="videoUrl ?? undefined" />
    <AudioPlayerFooter
      :loaded-audio="loadedVideo"
      :audio-duration="videoDuration"
      :audio-current-time="videoCurrentTime"
      :is-playing="videoIsPlaying"
      @play-pause-audio="videoIsPlaying ? pauseVideo() : playVideo()"
      @slider-input="onSliderInput"
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
