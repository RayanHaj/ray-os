<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import type { Tile } from '@/types/Tile.ts'
import { useBrowserStore } from '@/stores/browser.ts'

const props = defineProps({
  rowNumber: {
    type: Number,
    required: true,
  },
  getTile: {
    type: Number,
    required: false
  }
});

// const tiles = ref<Tile[]>([]);

const gridStore = useGridStore();
const browserStore = useBrowserStore();
const tileCountHorizontal = useTileCountGrid().x;

function calculateId(x: number) {
  const id = ((props.rowNumber - 1) * tileCountHorizontal.value + x);

  const tile: Tile = { 'id': id, 'iconUrl': '', 'label': '' }
  pushTile(tile);

  return id.toString();
}

function pushTile(tile: Tile) {
  if (browserStore.windowResizing === false) {
    gridStore.tiles.push(tile);
  }
}

const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
}
</script>

<template>
  <div
    v-for="x in tileCountHorizontal"
    :id="calculateId(x)"
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
