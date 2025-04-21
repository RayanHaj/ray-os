<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { type Component, computed, shallowRef, watchEffect } from 'vue'
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts'

const props = defineProps({
  rowNumber: {
    type: Number,
    required: true,
  },
})

const tileCountHorizontal = useTileCountGrid().x

function calculateId(x: number) {
  return (props.rowNumber - 1) * tileCountHorizontal.value + x
}

const gridStore = useGridStore()
const getTiles = computed(() => {
  return gridStore.tiles
})

const svgs = shallowRef<{ id: number; component: Component }[]>([]);
watchEffect(() => {
  (async () => {
    const newSvgs: { id: number; component: Component }[] = [];
    for (let i = 1; i <= tileCountHorizontal.value; i++) {
      const tile = getTileByTileHorizontalPosition(i)
      if (!tile || (tile && tile.iconImageName === '')) {
        continue;
      }

      const svg = await useSvgByFileNameAndDirectory('applications', tile.iconImageName);
      if (!svg) {
        continue;
      }

      newSvgs.push({
        id: tile.id,
        component: svg,
      });
    }

    svgs.value = newSvgs;
  })();
});

function tileContainsApplication(id: number) {
  const tile = getTiles.value.find(tile => tile.id === id);
  if (!tile) {
    return false;
  }

  return tile.label !== '' && tile.iconImageName !== '';
}

function getTileByTileHorizontalPosition(x: number) {
  const id = calculateId(x);
  const tile = getTiles.value.find(tile => tile.id === id);
  if (!tile) {
    return null;
  }

  return tile;
}

function getSvgByTileHorizontalPosition(x: number) {
  const id = calculateId(x);
  const svg = svgs.value.find(svg => svg.id === id);
  if (!svg) {
    return null;
  }

  return svg;
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
    :class="{'filled': tileContainsApplication(calculateId(x))}"
    :key="x"
    :style="tileStyling"
  >
    <div class="content">
      <component
        v-if="svgs.some((svg) => svg.id === calculateId(x))"
        :is="getSvgByTileHorizontalPosition(x)?.component"
        :custom-width="50"
        :custom-height="50"
      />
      <div>{{ getTileByTileHorizontalPosition(x)?.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.tile.filled:hover {
  background-color: var(--button-secondary-color);
  border-radius: 10px;
}

.content {
  text-align: center;
  font-size: 13px;
  color: var(--text-color);
}
</style>
