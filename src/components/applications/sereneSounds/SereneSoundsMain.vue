<script setup lang="ts">
import SereneSoundsFooter from '@/components/applications/sereneSounds/SereneSoundsFooter.vue';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useGetInitialSounds } from '@/composables/useGetInitialSounds.ts';
import SereneSoundsCollection
  from '@/components/applications/sereneSounds/collection/SereneSoundsCollection.vue';

const sereneSoundsStore = useSereneSoundsStore();

const loaded = ref(false);
onBeforeMount(async () => {
  if (Object.keys(sereneSoundsStore.sounds).length === 0) {
    const initSounds = await useGetInitialSounds();
    if (initSounds) {
      sereneSoundsStore.sounds = initSounds;
    }
  }

  loaded.value = true;
});

onUnmounted(() => {
  sereneSoundsStore.pauseAllSounds();
});
</script>

<template>
  <div class="serene-sounds-main" v-if="loaded">
    <SereneSoundsCollection />
    <SereneSoundsFooter />
  </div>
</template>

<style scoped>
.serene-sounds-main {
  width: 100%;
  height: calc(100% - 30px);
}
</style>
