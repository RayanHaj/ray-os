<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { type Component, computed, onMounted, ref, shallowRef, watchEffect } from 'vue';
import type { Item } from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { tilePosition } = defineProps<{ tilePosition: {x: number, y: number}}>();
const verticalTileCount = useTileCountGrid().y;

const tileItem = ref<Item>();
const tileId = ref<number>(0);
const tileSvg = shallowRef<Component>();

const gridStore = useGridStore();
function updateTile() {
  tileId.value = (tilePosition.x - 1) * verticalTileCount.value + tilePosition.y;
  tileItem.value = gridStore.items.find((tile) => tile.content.id === tileId.value);
  if (tileItem.value && tileItem.value.content.type === 'application' && tileItem.value.label !== '') {
    tileSvg.value = useSvgOrFallback(tileItem.value.label);
  }
}

onMounted(() => {
  updateTile();
});
watchEffect(() => {
  updateTile();
});

const tileContainsApplication = computed(() => {
  if (!tileItem.value) {
    return false;
  }
  if (!tileItem.value.content) {
    return false;
  }
  if (!tileItem.value.label) {
    return false;
  }

  return tileItem.value.content.type === 'application';
});
const tileStyling = { width: `${gridStore.tileWidth}px`, height: `${gridStore.tileHeight}px` };

function onDragStart(event: DragEvent) {
  const id = tileItem.value?.content.id;
  if (!id) {
    return;
  }
  event?.dataTransfer?.setData('text/plain', id.toString());
}

function onDrop(event: DragEvent) {
  const targetId = Number((event.currentTarget as HTMLElement).id);
  const sourceId = Number(event.dataTransfer?.getData('text/plain'));

  const sourceItem: Item | undefined = gridStore.items.find(item => item.content.id === sourceId);
  if (!sourceItem) {
    return;
  }

  const targetIndex = gridStore.items.findIndex((tile) => tile.content.id === targetId);
  const sourceIndex = gridStore.items.findIndex((tile) => tile.content.id === sourceId);

  if (targetIndex !== -1 || sourceId === -1) {
    return;
  }

  const splicedValues = gridStore.items.splice(sourceIndex, 1, sourceItem);
  if (splicedValues.length === 0) {
    return;
  }

  sourceItem.content.id = targetId;
  gridStore.items.push(sourceItem);
}

function openWindow() {
  if (!tileItem.value) return;
  useWindowStore().pushOpenWindowReference(tileItem.value.label);
}
</script>

<template>
  <div
    :id="tileId.toString()"
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
    <div class="content" v-if="tileItem">
      <component v-if="tileSvg" :is="tileSvg" :custom-width="35" :custom-height="35" />
      <div>{{ tileItem.label }}</div>
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
  border-radius: 5px;
}

.tile.filled:hover {
  background-color: var(--button-hover-color);
}

.content {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-color);
}
</style>
