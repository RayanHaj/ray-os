<script setup lang="ts">
import { onMounted, onUnmounted, type Ref, ref, watch, watchEffect } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';
import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';

const audioPlayerStore = useAudioPlayerStore();

const windowId = useInjectOrThrow<string>('windowId');

const loadedAudio: Ref<LoadedAudio> = ref({ windowId: null, file: null });
const audioUrl: Ref<string | null> = ref(null);

const audioObject = ref<HTMLAudioElement | null>(null);
const audioDuration = ref(0);
const audioCurrentTime = ref(0);
const isPlaying = ref(false);

onMounted(() => {
  audioObject.value = new Audio();
  audioObject.value.addEventListener('loadedmetadata', updateAudioDuration);
  audioObject.value.addEventListener('timeupdate', onTimeUpdate);
});

onUnmounted(() => {
  if (audioObject.value) {
    audioObject.value.removeEventListener('loadedmetadata', updateAudioDuration);
    audioObject.value.removeEventListener('timeupdate', onTimeUpdate);
    audioObject.value.src = '';
    audioObject.value = null;

    audioPlayerStore.removeAudioElement(windowId);
  }

  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});

watchEffect(() => {
  if (audioPlayerStore.loadedAudio.windowId !== windowId) {
    return;
  }

  loadedAudio.value = audioPlayerStore.loadedAudio;
  if (audioPlayerStore.loadedAudio.file) {
    audioUrl.value = URL.createObjectURL(audioPlayerStore.loadedAudio.file);

    if (audioObject.value) {
      audioObject.value.src = audioUrl.value;
    }
  }
});

const audioElementRef = ref();
watch(
  [audioElementRef, audioUrl],
  () => {
    if (audioElementRef.value instanceof HTMLAudioElement && loadedAudio.value.file) {
      audioPlayerStore.setAudioElement(windowId, audioElementRef.value, loadedAudio.value.file);
    }
  },
  { immediate: true },
);

function updateAudioDuration() {
  audioDuration.value = audioObject.value?.duration ?? 0;
}

function onTimeUpdate() {
  if (Math.floor(audioDuration.value) === Math.floor(audioCurrentTime.value) && audioObject.value) {
    audioCurrentTime.value = 0;
    audioObject.value.currentTime = 0;
    return;
  }
  audioCurrentTime.value = audioObject.value?.currentTime ?? 0;
}

function playAudio() {
  if (audioObject.value === null) return;

  audioObject.value.play();
  isPlaying.value = true;
}

function pauseAudio() {
  if (audioObject.value === null) return;

  audioObject.value.pause();
  isPlaying.value = false;
}

function onSliderInput(time: number) {
  if (audioObject.value) audioObject.value.currentTime = time;
}
</script>
<template>
  <div class="audio-player">
    <div class="content">
      {{ loadedAudio.file?.name ?? 'load audio through File Explorer' }}
    </div>
    <AudioPlayerFooter
      :loaded-audio="loadedAudio"
      :audio-duration="audioDuration"
      :audio-current-time="audioCurrentTime"
      :is-playing="isPlaying"
      @play-pause-audio="isPlaying ? pauseAudio() : playAudio()"
      @slider-input="onSliderInput"
    />
  </div>
</template>
<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  --audio-player-header-height: 50px;
  --audio-player-footer-height: 80px;
  color: var(--text-color);
}

.content {
  display: flex;
  gap: 5px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - var(--audio-player-header-height));
}
</style>
