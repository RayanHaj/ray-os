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
import { useWindowStore } from '@/stores/window.ts'

const props = defineProps({
  position: {
    type: Object,
    required: true,
  }
})

const tileCountVertical = useTileCountGrid().y;

const windowStore = useWindowStore();
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

function onDrop(event: DragEvent) {
  const targetId = Number((event.currentTarget as HTMLElement).id);
  const sourceJSONString = event.dataTransfer?.getData('application/json');

  let source: Tile | null = null;
  if (sourceJSONString) {
    try {
      source = JSON.parse(sourceJSONString);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  if (source === null) return;

  const sourceIndex = gridStore.tiles.findIndex(tile => tile.content.id === source?.content.id);
  if (sourceIndex !== -1) {
    gridStore.tiles.splice(sourceIndex, 1);
  }

  const targetIndex = gridStore.tiles.findIndex(tile => tile.content.id === targetId);
  if (targetIndex === -1) {
    source.content.id = targetId;
    gridStore.tiles.push(source);
  } else {
    return;
  }
}
function openWindow() {
  if (!tile.value) return;
  windowStore.pushOpenWindowReference(tile.value.label);
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
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent="onDrop"
    @dblclick="openWindow"
  >
    <div class="content" v-if="tile && svg">
      <component
        v-if="svg.id === id"
        :is="svg.component"
        :custom-width="50"
        :custom-height="50"
      />
      <div>{{ tile.label }}</div>
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
