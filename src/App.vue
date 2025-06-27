<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted } from 'vue';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useGridStore } from '@/stores/grid.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useSvgsStore } from '@/stores/svgs.ts';

const sereneSoundsStore = useSereneSoundsStore();
const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const gridStore = useGridStore();
const svgsStore = useSvgsStore();

onBeforeMount(async () => {
  await svgsStore.initializeSvgs();
  await sereneSoundsStore.initializeSounds();
  taskbarStore.initializeTaskbar();
  gridStore.updateTileContent();
  browserStore.startListening();
});
onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
