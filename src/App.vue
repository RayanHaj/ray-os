<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted } from 'vue';
import { useFileStore } from '@/stores/file.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useGridStore } from '@/stores/grid.ts';

const browserStore = useBrowserStore();
const fileStore = useFileStore();
const taskbarStore = useTaskbarStore();
const gridStore = useGridStore();

onBeforeMount(async () => {
  await fileStore.initializeFiles();
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
