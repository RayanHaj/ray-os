<script setup lang="ts">
import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { loadedAudio, audioDuration, audioCurrentTime, isPlaying } = defineProps<{
  loadedAudio: LoadedAudio;
  audioDuration: number;
  audioCurrentTime: number;
  isPlaying: boolean;
}>();

const emits = defineEmits(['playPauseAudio', 'sliderInput']);

const playSvg = useSvgOrFallback('Play');
const pauseSvg = useSvgOrFallback('Pause');
const menuDots = useSvgOrFallback('MenuDots');

const calculateTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secondRemainder = Math.floor(seconds % 60);
  return `${minutes}:${secondRemainder < 10 ? `0${secondRemainder}` : secondRemainder}`;
};

function onSliderInput(event: Event) {
  emits('sliderInput', Number((event.target as HTMLInputElement).value));
}
</script>
<template>
  <div class="audio-player-footer">
    <div class="audio-progress-controls">
      <div>{{ calculateTime(audioCurrentTime) }}</div>
      <input
        type="range"
        :max="audioDuration"
        :value="audioCurrentTime"
        step="0.1"
        @input="onSliderInput"
      />
      <div>{{ calculateTime(audioDuration) }}</div>
    </div>
    <div class="audio-controls">
      <div class="start">
        <p class="audio-file-name">{{ loadedAudio.file?.name ?? '' }}</p>
      </div>
      <div class="middle">
        <button class="play-button" @click="emits('playPauseAudio')">
          <component
            :is="isPlaying ? pauseSvg.svg : playSvg.svg"
            :custom-width="25"
            :custom-height="25"
          />
        </button>
      </div>
      <div class="end">
        <button class="menu-dot-button">
          <component :is="menuDots.svg" :custom-width="25" :custom-height="25" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.audio-player-footer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--audio-player-footer-height);

  --audio-progress-controls-height: calc(var(--audio-player-footer-height) / 3);
  --audio-controls-height: calc((var(--audio-player-footer-height) / 3) * 2);
}

.audio-progress-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  height: var(--audio-progress-controls-height);
  padding-inline: 10px;
}

.audio-progress-controls input {
  width: 100%;
  margin-top: 3px;
}

.audio-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: var(--audio-controls-height);
  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 10px;
}

.start,
.middle,
.end {
  display: flex;
  width: calc(100% / 3);
}

.start {
  justify-content: start;
}

.middle {
  justify-content: center;
}

.end {
  justify-content: end;
}

.audio-file-name {
  min-width: 100px;
}

button {
  cursor: pointer;
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-primary-color);
  border: none;
  border-radius: 100%;
  width: 35px;
  height: 35px;
}

.menu-dot-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
}
</style>
