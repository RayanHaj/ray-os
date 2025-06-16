<script setup lang="ts">
import SereneSoundsPlayingSound from '@/components/applications/sereneSounds/SereneSoundsPlayingSound.vue';
import { useDateTime } from '@/composables/UseDateTime.ts';
import { ref, watch } from 'vue';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useWindowStore } from '@/stores/window.ts';

const { time } = useDateTime();

const showSoundProcess = ref(false);

const sereneSoundsStore = useSereneSoundsStore();
const windowStore = useWindowStore();
watch(
  () => sereneSoundsStore.playingSounds,
  (newVal, oldValue) => {
    const windowCount = windowStore.getWindowCountByName('Serene Sounds');
    showSoundProcess.value = (oldValue.length !== 0 || newVal.length !== 0) && windowCount !== 0;
  },
);
</script>

<template>
  <div class="time-process-wrapper" :class="showSoundProcess ? 'show-background-color' : ''">
    {{ time }}
    <SereneSoundsPlayingSound v-show="showSoundProcess"/>
  </div>
</template>

<style scoped>
.time-process-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 20px;
  font-family: 'Courier New', sans-serif;
  align-items: end;
  padding: 10px;
  border-radius: 5px;
}

.show-background-color {
  background-color: var(--button-secondary-color);
}
</style>
