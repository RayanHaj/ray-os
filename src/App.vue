<script setup lang="ts">
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useSvgsStore } from '@/stores/svgs.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import DesktopView from '@/views/DesktopView.vue';

const sereneSoundsStore = useSereneSoundsStore();
const browserStore = useBrowserStore();
const gridStore = useDesktopStore();
const svgsStore = useSvgsStore();

const initialised = ref(false);
const rayDb = useInjectOrThrow<RayDb>('rayDb');
onBeforeMount(async () => {
  browserStore.startListening();
  await svgsStore.initializeSvgs();
  await sereneSoundsStore.initializeSounds();
  await gridStore.initializeTileContent(rayDb);
  initialised.value = true;
});
onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <DesktopView v-if="initialised"/>
</template>

<style scoped></style>
