<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import {
  type Component,
  computed,
  ref,
  shallowRef,
  watchEffect
} from 'vue'
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts'
import type { Tile } from '@/types/Tile.ts'

const props = defineProps({
  position: {
    type: Object,
    required: true,
  }
})

const tileCountVertical = useTileCountGrid().y

const gridStore = useGridStore();
const tile = ref<Tile>();
const id = ref<number>(0);
watchEffect(() => {
  id.value = (props.position.x - 1) * tileCountVertical.value + props.position.y;
  tile.value = gridStore.tiles.find((tile) => tile.content.id === id.value);
});

const svg = shallowRef<{ id: number; component: Component }>()
watchEffect(() => {
  (async () => {
    if (!tile.value) {
      return;
    }
    if (!tile.value.content) {
      return;
    }

    if (tile.value.content.type === 'application' && tile.value.content.iconImageName !== '') {
      const getSvg = await useSvgByFileNameAndDirectory(
        'applications',
        tile.value.content.iconImageName,
      )
      if (!getSvg) {
        return
      }

      svg.value = { id: tile.value.content.id, component: getSvg };
    }
  })();
});

const tileContainsApplication = computed(() => {
  if (!tile.value) {
    return false;
  }
  if (!tile.value.content) {
    return false;
  }
  if (tile.value.content.type === 'file') {
    return false;
  }
  return tile.value?.label !== '' && tile.value?.content.iconImageName !== '';
});
const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
}

function onDragStart(event: DragEvent) {
  const id = tile.value?.content.id;
  if (!id) {
    return;
  }

  event?.dataTransfer?.setData('application/json', JSON.stringify(tile.value));
}
</script>

<template>
  <div
    :id="id.toString()"
    class="tile"
    :class="{ filled: tileContainsApplication }"
    :style="tileStyling"
    :draggable="tileContainsApplication"
    @dragstart="onDragStart"
  >
    <div class="content" v-if="tile">
      <component
        v-if="svg?.id === id"
        :is="svg?.component"
        :custom-width="50"
        :custom-height="50"
      />
      <div>{{ tile?.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  width: 100%;
  height: 100%;
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
