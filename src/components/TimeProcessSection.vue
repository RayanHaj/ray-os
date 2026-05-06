<script setup lang="ts">
import SereneSoundsPlayingSound from '@/components/applications/sereneSounds/SereneSoundsPlayingSound.vue';
import { useDateTime } from '@/composables/helpers/UseDateTime.ts';
import { type Ref, ref, watch } from 'vue';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';

const { time } = useDateTime();

const soundProcess: Ref<'Serene Sounds' | 'Audio Player' | 'None'> = ref('None');

const sereneSoundsStore = useSereneSoundsStore();
const audioPlayerStore = useAudioPlayerStore();

const windowStore = useWindowStore();

watch(
  () => sereneSoundsStore.playingSounds,
  (newVal, oldValue) => {
    const windowCount = windowStore.getWindowCountByName('Serene Sounds');

    if ((oldValue.length !== 0 || newVal.length !== 0) && windowCount !== 0) {
      soundProcess.value = 'Serene Sounds';
    } else {
      soundProcess.value = 'None';
    }
  },
);

watch(
  () => audioPlayerStore.audioElementCount,
  (newVal) => {
    if (newVal > 0) {
      soundProcess.value = 'Audio Player';
    } else {
      soundProcess.value = 'None';
    }
  },
);
</script>

<template>
  <div class="time-process-wrapper" :class="soundProcess ? 'show-background-color' : ''">
    {{ time }}
    <SereneSoundsPlayingSound
      v-show="soundProcess === 'Audio Player' || soundProcess === 'Serene Sounds'"
      :sound-process="soundProcess"
    />
  </div>
</template>

<style scoped>
.time-process-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: var(--font-size-elg);
  font-family: 'Courier New', sans-serif;
  align-items: end;
  padding: 6px;
  padding-inline: 10px;
  width: fit-content;
  border-radius: 5px;
}

.show-background-color {
  background-color: var(--button-secondary-color);
}
</style>
