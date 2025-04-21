<script setup lang="ts">
import TileComponent from '@/components/DesktopGridTile.vue'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { onMounted, onUnmounted } from 'vue'
import { useBrowserStore } from '@/stores/browser.ts'
import { useTaskbarStore } from '@/stores/taskbar.ts'

const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const tileCountVertical = useTileCountGrid().y;
onMounted(() => {
  browserStore.startListening();
});

onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <div class="container" :style="{height: `${browserStore.height - taskbarStore.taskbarHeight}px`}">
    <div class="grid">
      <div class="row" v-for="row in tileCountVertical" :key="row">
        <TileComponent :row-number="row"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.row {
  display: flex;
  flex-direction: row;
}
</style>
