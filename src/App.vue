<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useGridStore } from '@/stores/grid.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useSvgsStore } from '@/stores/svgs.ts';

const sereneSoundsStore = useSereneSoundsStore();
const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const gridStore = useGridStore();
const svgsStore = useSvgsStore();

const initialised = ref(false);
onBeforeMount(async () => {
  taskbarStore.initializeTaskbar();
  gridStore.updateTileContent();
  browserStore.startListening();
  await svgsStore.initializeSvgs();
  await sereneSoundsStore.initializeSounds();
  initialised.value = true;
});
onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <RouterView v-if="initialised"/>
</template>

<style scoped></style>
