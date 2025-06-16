<script setup lang="ts">
import SereneSoundsFooter from '@/components/applications/sereneSounds/SereneSoundsFooter.vue';
import { onBeforeMount, onUnmounted } from 'vue';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useGetInitialSounds } from '@/composables/useGetInitialSounds.ts';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';

const sereneSoundsStore = useSereneSoundsStore();
onBeforeMount(async () => {
  if (Object.keys(sereneSoundsStore.sounds).length === 0) {
    const initSounds = await useGetInitialSounds();
    if (initSounds) {
      sereneSoundsStore.sounds = initSounds;
    }
  }

  await sereneSoundsStore.playSound(Object.keys(sereneSoundsStore.sounds)[0] as AllowedSoundNames);
});

onUnmounted(() => {
  sereneSoundsStore.pauseAllSounds();
});
</script>

<template>
  <div class="serene-sounds-main">
    <SereneSoundsFooter />
  </div>
</template>

<style scoped>
.serene-sounds-main {
  width: 100%;
  height: calc(100% - 30px);
}
</style>
