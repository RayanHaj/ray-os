<script setup lang="ts">
import SereneSoundsFooter from '@/components/applications/sereneSounds/SereneSoundsFooter.vue';
import { onUnmounted } from 'vue';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import SereneSoundsCollection from '@/components/applications/sereneSounds/collection/SereneSoundsCollection.vue';

const sereneSoundsStore = useSereneSoundsStore();
onUnmounted(() => {
  sereneSoundsStore.pauseAllSounds();
});
</script>

<template>
  <div class="serene-sounds-main">
    <SereneSoundsCollection />
    <SereneSoundsFooter />
  </div>
</template>
