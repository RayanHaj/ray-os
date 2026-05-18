<script setup lang="ts">
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { fileName, isPlaying } = defineProps<{ fileName: string; isPlaying: boolean }>();

const emit = defineEmits(['playPauseAudio']);

const playSvg = useSvgOrFallback('Play');
const pauseSvg = useSvgOrFallback('Pause');
const menuDots = useSvgOrFallback('MenuDots');
</script>
<template>
  <li>
    <p>{{ fileName }}</p>
    <div class="button-wrapper">
      <button class="play-button" @click="emit('playPauseAudio')">
        <component :is="isPlaying ? pauseSvg.svg : playSvg.svg" />
      </button>
    </div>
  </li>
</template>
<style scoped>
li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 50%;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 10px;
}

.button-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
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

@container (max-width: 900px) {
  li {
    width: 100%;
  }
}
</style>
