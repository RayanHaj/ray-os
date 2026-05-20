<script setup lang="ts">
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { fileName, audioDuration, audioCurrentTime, isPlaying, looped } = defineProps<{
  fileName: string;
  audioDuration: number;
  audioCurrentTime: number;
  isPlaying: boolean;
  looped: boolean;
}>();

const emits = defineEmits(['playPauseAudio', 'sliderInput', 'loopAudio']);

const playSvg = useSvgOrFallback('Play');
const pauseSvg = useSvgOrFallback('Pause');
const menuDots = useSvgOrFallback('MenuDots');
const loopSvg = useSvgOrFallback('Loop');

const calculateTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secondRemainder = Math.floor(seconds % 60);
  return `${minutes}:${secondRemainder < 10 ? `0${secondRemainder}` : secondRemainder}`;
};

function onSliderInput(event: Event) {
  emits('sliderInput', Number((event.target as HTMLInputElement).value));
}

function getTrackBackground(value: number, min: number, max: number) {
  if (!max)
    return `linear-gradient(to right, var(--input-border-color) 0%, var(--input-border-color) 100%)`;
  const percentage = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, var(--button-primary-color) ${percentage}%, var(--input-border-color) ${percentage}%)`;
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
        :style="{ background: getTrackBackground(audioCurrentTime, 0, audioDuration) }"
        step="0.1"
        @input="onSliderInput"
      />
      <div>{{ calculateTime(audioDuration) }}</div>
    </div>
    <div class="audio-controls">
      <div class="start">
        <p class="audio-file-name">{{ fileName ?? '' }}</p>
      </div>
      <div class="middle">
        <button class="play-button" @click="emits('playPauseAudio')">
          <component
            :is="isPlaying ? pauseSvg.svg : playSvg.svg"
          />
        </button>
      </div>
      <div class="end">
        <button
          class="audio-control-button loop"
          :class="{ active: looped }"
          @click="emits('loopAudio')"
        >
          <component :is="loopSvg.svg" :custom-width="20" :custom-height="20" />
        </button>
        <button class="audio-control-button">
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
  gap: 20px;
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

.audio-control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
}

.audio-control-button.loop {
  padding: 5px;
}

.audio-control-button.loop.active {
  background: var(--highlight-color);
  border-radius: 50%;
}

input[type='range'] {
  -webkit-appearance: none;
  width: 100%;
  cursor: pointer;
}

/* --- Webkit Browsers --- */
input[type='range']::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent;
  border-radius: 0px;
  border: 0px solid #cbd5e1;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.1);
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 14px;
  width: 14px;
  background: var(--button-primary-color);
  border-radius: 10px;
  border: 0 solid #ffffff;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3);
  margin-top: -5px;
}

/* --- Firefox --- */
input[type='range']::-moz-range-track {
  height: 4px;
  background: transparent;
  border-radius: 0px;
  border: 0 solid #cbd5e1;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
}

input[type='range']::-moz-range-thumb {
  height: 14px;
  width: 14px;
  background: var(--button-primary-color);
  border-radius: 10px;
  border: 0 solid #ffffff;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3);
}
</style>
