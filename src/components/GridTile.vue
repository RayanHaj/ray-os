<script setup lang="ts">
import { useGridStore } from '@/stores/grid.ts';
import { useFileStore } from '@/stores/file.ts';
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts';
import { type Component, computed, onMounted, ref, shallowRef, watchEffect } from 'vue';
import type { Item } from '@/types/Item.ts';
import { useWindowStore } from '@/stores/window.ts';

const props = defineProps({
  position: {
    type: Object,
    required: true,
  },
});

const tileCountVertical = useTileCountGrid().y;

const windowStore = useWindowStore();
const gridStore = useGridStore();
const fileStore = useFileStore();
const item = ref<Item>();
const id = ref<number>(0);
const svg = shallowRef<Component>();

function updateTile() {
  id.value = (props.position.x - 1) * tileCountVertical.value + props.position.y;
  item.value = gridStore.items.find((tile) => tile.content.id === id.value);
  if (item.value && item.value.content.type === 'application' && item.value.label !== '') {
    svg.value = fileStore.fileSvgs[item.value.label];
  }
}

onMounted(() => {
  updateTile();
});

watchEffect(() => {
  updateTile();
});

const getSvg = computed(() => svg.value);

const tileContainsApplication = computed(() => {
  if (!item.value) {
    return false;
  }
  if (!item.value.content) {
    return false;
  }
  if (!item.value.label) {
    return false;
  }

  return item.value.content.type === 'application';
});
const tileStyling = {
  width: `${gridStore.tileWidth}px`,
  height: `${gridStore.tileHeight}px`,
};

function onDragStart(event: DragEvent) {
  const id = item.value?.content.id;
  if (!id) {
    return;
  }
  event?.dataTransfer?.setData('application/json', JSON.stringify(item.value));
}

function onDrop(event: DragEvent) {
  const targetId = Number((event.currentTarget as HTMLElement).id);
  const sourceJSONString = event.dataTransfer?.getData('application/json');

  let source: Item | null = null;
  if (sourceJSONString) {
    try {
      source = JSON.parse(sourceJSONString);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  if (source === null) return;

  const sourceIndex = gridStore.items.findIndex((tile) => tile.content.id === source?.content.id);
  if (sourceIndex !== -1) {
    gridStore.items.splice(sourceIndex, 1);
  }

  const targetIndex = gridStore.items.findIndex((tile) => tile.content.id === targetId);
  if (targetIndex === -1) {
    source.content.id = targetId;
    gridStore.items.push(source);
  } else {
    return;
  }
}
function openWindow() {
  if (!item.value) return;
  windowStore.pushOpenWindowReference(item.value.label);
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
    <div class="content" v-if="item">
      <component v-if="svg" :is="getSvg" :custom-width="50" :custom-height="50" />
      <div>{{ item.label }}</div>
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
  font-size: 13px;
  color: var(--text-color);
}
</style>
