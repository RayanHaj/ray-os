<script setup lang="ts">
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import SoundCard from '@/components/applications/sereneSounds/collection/SoundCard.vue';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';

const sereneSoundsStore = useSereneSoundsStore();
</script>

<template>
  <div class="serene-sounds-collection">
    <SoundCard
      v-for="[soundName, properties] of Object.entries(sereneSoundsStore.sounds)"
      :key="soundName"
      :sound="{ name: soundName as AllowedSoundNames, type: properties.type }"
    />
  </div>
</template>

<style scoped>
.serene-sounds-collection {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 50%;
  gap: 15px;
  height: calc(100% - 30px);
}
</style>
