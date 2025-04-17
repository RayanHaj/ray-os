<script setup lang="ts">
import { computed } from 'vue'
import { useGridStore } from '@/stores/grid.ts'
import { useBrowserWindowSize } from '@/composables/useBrowserWindowSize.ts'

const props = defineProps({
  taskbarHeight: {
    type: Number,
    required: true
  }
});

const { width } = useBrowserWindowSize();

const gridStore = useGridStore();
const tileCountHorizontal = computed(() =>
  Math.floor((width.value - props.taskbarHeight) / gridStore.tileWidth)
);

const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
}
</script>

<template>
  <div class="tile" v-for="x in tileCountHorizontal" :key="x" :style="tileStyling">

  </div>
</template>

<style scoped>
.tile {
  border: 1px white solid;
  background: orangered;
}
</style>
