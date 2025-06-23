<script setup lang="ts">
import { onBeforeMount, ref, shallowRef, watch } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';

const sounds = ref<AllowedSoundNames[]>([]);
const playSvg = shallowRef();
const pauseSvg = shallowRef();
const playing = ref(false);

const sereneSoundsStore = useSereneSoundsStore();
onBeforeMount(async () => {
  playSvg.value = await useSvgByFileNameAndDirectory('ui', 'Play');
  pauseSvg.value = await useSvgByFileNameAndDirectory('ui', 'Pause');
});

watch(
  () => sereneSoundsStore.playingSounds,
  (newVal, oldVal) => {
    if (newVal.length > 0) {
      sounds.value = newVal;
      playing.value = true;
    } else {
      sounds.value = oldVal;
      playing.value = false;
    }
  },
);

async function onPlay() {
  playing.value = !playing.value;
  if (playing.value) {
    for (const sound of sounds.value) {
      await sereneSoundsStore.playSound(sound);
    }
  } else {
    sereneSoundsStore.pauseAllSounds();
  }
}
</script>

<template>
  <div class="serene-sounds-playing-sound">
    <h4 class="sound-name">{{ sounds.length > 1 ? 'multiple' : sounds[0] }}</h4>
    <button class="play-button" @click="onPlay">
      <component :is="playing ? pauseSvg : playSvg" :custom-width="15" :custom-height="15" />
    </button>
  </div>
</template>

<style scoped>
.serene-sounds-playing-sound {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 230px;
  height: 30px;
  background-color: var(--button-primary-color);
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.sound-name {
  font-size: 15px;
  color: var(--text-color);
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--button-secondary-color);
  border: none;
}

.play-button:hover {
  background-color: var(--button-hover-color);
}
</style>
