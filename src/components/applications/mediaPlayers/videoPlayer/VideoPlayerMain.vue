<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { computed, onMounted, onUnmounted, ref, type Ref, watch, watchEffect } from 'vue';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import type { LoadedVideo } from '@/types/videoPlayerTypes.js';
import MediaPlayerFooter from '@/components/applications/mediaPlayers/MediaPlayerFooter.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

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
  }

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }

  videoPlayerStore.removeLoadedVideo(windowId);
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

watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (returnValues) => {
    const returnValue = returnValues.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!returnValue || !fileExplorerWindowId.value) return;

    for (const value of returnValue.value) {
      if (!value.fileItem.rawFile) return;

      videoPlayerStore.initVideoFileAndUrl(windowId, value.fileItem.rawFile);
    }

    useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
  },
);

const fileExplorerWindowId = ref<string>();
function handleSelectTextFile() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(
    windowId,
    nextFileExplorerId,
    ['video/mp4'],
    false,
  );

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

const fileExplorerWindowIsOpen = computed(() =>
  useWindowStore().openWindowsReferences['File Explorer']?.some(
    (reference) =>
      useWindowStore().getWindowId('File Explorer', reference.id) === fileExplorerWindowId.value,
  ),
);
</script>
<template>
  <div class="video-player">
    <video v-if="videoUrl" ref="videoRef" :src="videoUrl" />
    <div v-else class="select-text-file">
      <div class="select-text-file-wrapper">
        <button @click="handleSelectTextFile" :disabled="fileExplorerWindowIsOpen">
          <span>
            <component :is="useSvgOrFallback('Upload').svg" />
            Click to select a text file
          </span>
        </button>
      </div>
    </div>
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

  --audio-player-footer-height: 80px;
}

.video-player video {
  width: 100%;
  max-width: 100%;
  max-height: calc(100% - var(--audio-player-footer-height));
  object-fit: contain;
}

.select-text-file {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  max-height: 100%;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.select-text-file {
  justify-self: start;
}

.select-text-file-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.select-text-file-wrapper button {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: rgb(0, 0, 0, 0.5);
  font-size: var(--font-size-elg);
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.select-text-file-wrapper span {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
}

.select-text-file-wrapper svg {
  width: 50px;
  height: 50px;
}
</style>
