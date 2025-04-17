<script setup lang="ts">
import { useBrowserWindowSize } from '@/composables/useBrowserWindowSize.ts'
import { useGridStore } from '@/stores/grid.ts'
import { computed } from 'vue'
import Tile from '@/components/DesktopGridTile.vue'

const props = defineProps({
  taskbarHeight: {
    type: Number,
    required: true
  }
});

const { height } = useBrowserWindowSize();

const gridStore = useGridStore();
const tileCountVertical = computed(() =>
  Math.floor((height.value - props.taskbarHeight) / gridStore.tileHeight)
);
</script>

<template>
  <div class="grid">
    <div class="row" v-for="row in tileCountVertical" :key="row">
      <Tile :taskbar-height="taskbarHeight"/>
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
