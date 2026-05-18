<script setup lang="ts">
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';

const { fileName, isPlaying } = defineProps<{ fileName: string; isPlaying: boolean }>();

const emit = defineEmits(['playPauseAudio', 'removeAudioFromList']);

const playSvg = useSvgOrFallback('Play');
const pauseSvg = useSvgOrFallback('Pause');
const menuDots = useSvgOrFallback('MenuDots');

function onRightClick(event: MouseEvent) {
  useInitializeContextMenu(event)
    .audioPlayerListItem()
    .initialize(
      {
        Delete: () => {
          emit('removeAudioFromList');
        },
      },
      {},
    );
}
</script>
<template>
  <li @click.right.prevent="onRightClick">
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
  align-items: center;
  width: 100%;
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
</style>
