<script setup lang="ts">
import { onBeforeMount, type PropType, ref, shallowRef, watch } from 'vue';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';

const props = defineProps({
  sound: {
    type: Object as PropType<{name: AllowedSoundNames, type: string}>
  }
});

const playing = ref(false);
const playSvg = shallowRef();
const pauseSvg = shallowRef();
onBeforeMount(async () => {
  playSvg.value = await useSvgByFileNameAndDirectory('ui', 'Play');
  pauseSvg.value = await useSvgByFileNameAndDirectory('ui', 'Pause');
});

const sereneSoundsStore = useSereneSoundsStore();
watch(() => sereneSoundsStore.playingSounds, (newVal) => {
  if (!props.sound) {
    return;
  }

  playing.value = newVal.includes(props.sound.name);
});

function returnSvgBasedOnPlayState() {
  return playing.value ? pauseSvg.value : playSvg.value;
}

async function onPlay() {
  if (!props.sound) {
    return;
  }

  playing.value = !playing.value
  if (playing.value) {
    await sereneSoundsStore.playSound(props.sound.name);
  } else {
    sereneSoundsStore.pauseSound(props.sound.name);
  }
}
</script>

<template>
  <div :class="sound?.type" class="sound-card">
    <div class="sound-card-start">
      <div class="sound-name">{{ sound?.name }}</div>
    </div>
    <div class="sound-card-end">
      <button class="play-sound-btn" @click="onPlay">
        <component :is="returnSvgBasedOnPlayState()" :custom-width="25" :custom-height="25"/>
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
    border-radius: 10px;
  }
  .water {
    background-color: var(--tabs-background);
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
</style>
