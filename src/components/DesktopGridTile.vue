<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { computed } from 'vue'

const props = defineProps({
  rowNumber: {
    type: Number,
    required: true,
  },
})

const tileCountHorizontal = useTileCountGrid().x

function calculateId(x: number) {
  return (props.rowNumber - 1) * tileCountHorizontal.value + x;
}

const gridStore = useGridStore()
const getTiles = computed(() => {
  return gridStore.tiles;
})

const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
}
</script>

<template>
  <div
    v-for="x in tileCountHorizontal"
    :id="calculateId(x).toString()"
    class="tile"
    :key="x"
    :style="tileStyling"
  >
    <!--    {{ calculateId(x) < 20 ? getTiles.find(tile => tile.id === calculateId(x))?.id : null }}-->
  </div>
</template>

<style scoped>
.tile {
  border: 1px white solid;
  background: orangered;
}
</style>
