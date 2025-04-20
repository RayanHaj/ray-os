<script setup lang="ts">
import TileComponent from '@/components/DesktopGridTile.vue'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { onMounted, onUnmounted } from 'vue'
import { useBrowserStore } from '@/stores/browser.ts'

const browserStore = useBrowserStore();
const tileCountVertical = useTileCountGrid().y;
onMounted(() => {
  browserStore.startListening();
});

onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <div class="grid">
    <div class="row" v-for="row in tileCountVertical" :key="row">
      <TileComponent :row-number="row"/>
    </div>
  </div>
</template>

<style scoped>
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
