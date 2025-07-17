<script setup lang="ts">
import { onBeforeMount, type PropType, ref, shallowRef, watch } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import type { AllowedSoundCategories, AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';

const props = defineProps({
  sound: {
    type: Object as PropType<{ name: AllowedSoundNames; category: AllowedSoundCategories }>,
    required: true,
  },
});

const playing = ref(false);
const playSvg = shallowRef();
const pauseSvg = shallowRef();
onBeforeMount(async () => {
  playSvg.value = await useSvgByFileNameAndDirectory('Play');
  pauseSvg.value = await useSvgByFileNameAndDirectory('Pause');
});

const sereneSoundsStore = useSereneSoundsStore();
watch(
  () => sereneSoundsStore.playingSounds,
  (newVal) => {
    if (!props.sound) {
      return;
    }

    playing.value = newVal.includes(props.sound.name);
  },
);

function returnSvgBasedOnPlayState() {
  return playing.value ? pauseSvg.value : playSvg.value;
}

async function onPlay() {
  if (!props.sound) {
    return;
  }

  playing.value = !playing.value;
  if (playing.value) {
    await sereneSoundsStore.playSound(props.sound.name);
  } else {
    sereneSoundsStore.pauseSound(props.sound.name);
  }
}

const showRange = ref(false);
function onRangeInput(e: Event) {
  const event = e.target as HTMLInputElement;
  sereneSoundsStore.adjustVolume(props.sound.name, Number(event.value));
}
</script>

<template>
  <div class="sound-card" @mouseenter="showRange = true" @mouseleave="showRange = false">
    <div class="sound-card-start">
      <div class="sound-name">{{ sound.name }}</div>
      <input
        type="range"
        id="volume"
        min="0"
        max="1"
        value="1"
        step="0.01"
        :style="{ opacity: showRange ? '1' : '0' }"
        @input="onRangeInput"
      />
    </div>
    <div class="sound-card-end">
      <button class="play-sound-btn" @click="onPlay">
        <component :is="returnSvgBasedOnPlayState()" :custom-width="25" :custom-height="25" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.sound-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 250px;
  padding: 10px;
  color: var(--text-color);
  background-color: var(--tabs-background);
  border-radius: 10px;
}
.play-sound-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-secondary-color);
  border: none;
  border-radius: 50%;
  padding: 5px;
}
input {
  transition: opacity 0.2s;
}
</style>
