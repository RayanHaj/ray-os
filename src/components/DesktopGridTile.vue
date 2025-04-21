<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { type Component, computed, shallowRef, watchEffect } from 'vue'
import { useSvgByApplicationName } from '@/composables/useSvgByApplicationName.ts'

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

const gridStore = useGridStore();
const getTiles = computed(() => {
  return gridStore.tiles;
});

const svgs = shallowRef<{id: number, component: Component}[]>([]);
watchEffect( () => {
  (async () => {
    const newSvgs: {id: number, component: Component}[] = [];
    for (let i = 1; i <= tileCountHorizontal.value; i++) {
      const id = calculateId(i);
      const tile = getTiles.value.find(tile => tile.id === id);
      if (tile && tile.iconImageName !== '') {
        const svg = await useSvgByApplicationName(tile.iconImageName);
        if (svg !== null)
          newSvgs.push({
            id: id,
            component: svg
          });
      }
    }

    svgs.value = newSvgs;
  })();
});

function getTileInTemplate(x: number) {
  const id = calculateId(x);
  const tile = getTiles.value.find(tile => tile.id === id);
  if (!tile) {
    return null;
  }

  return tile;
}

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
    <div class="content">
      <component v-if="svgs.some(svg => svg.id === calculateId(x))" :is="svgs.find(svg => svg.id === calculateId(x))?.component" :custom-width="50" :custom-height="50"/>
      <div>{{getTileInTemplate(x)?.label}}</div>
    </div>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px white solid;
  user-select: none;
}
.tile:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
.content {
  text-align: center;
  font-size: 13px;
  color: white;
}
</style>
