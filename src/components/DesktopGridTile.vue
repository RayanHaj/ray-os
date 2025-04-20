<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'

const props = defineProps({
  rowNumber: {
    type: Number,
    required: true,
  }
});

const gridStore = useGridStore();
const tileCountHorizontal = useTileCountGrid().x;

function getId(x: number) {
  return ((props.rowNumber - 1) * tileCountHorizontal.value + x).toString();
}

const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
}
</script>

<template>
  <div
    v-for="x in tileCountHorizontal"
    :id="getId(x)"
    class="tile"
    :key="x"
    :style="tileStyling"
  ></div>
</template>

<style scoped>
.tile {
  border: 1px white solid;
  background: orangered;
}
</style>
