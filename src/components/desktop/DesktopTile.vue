<script setup lang="ts">
import { useDesktopStore } from '@/stores/desktop.ts';
import { onMounted, ref, watch } from 'vue';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useBrowserStore } from '@/stores/browser.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { useHandleDesktopFileClicked } from '@/composables/desktop/useHandleDesktopFileClicked.ts';
import type { DesktopTileItem } from '@/types/desktopTypes.ts';
import { useHandleDesktopTileDragStart } from '@/composables/desktop/useHandleDesktopTileDragStart.ts';
import { useHandleDesktopTileDrop } from '@/composables/desktop/useHandleDesktopTileDrop.ts';
import { useGetSvgByDesktopTileItem } from '@/composables/desktop/useGetSvgByDesktopTileItem.ts';
import { useOpenFileExplorerWindowByPath } from '@/composables/fileExplorer/useOpenFileExplorerWindowByPath.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const desktopStore = useDesktopStore();

const emit = defineEmits(['dragStarted', 'dragEnded']);
const { tileId } = defineProps<{ tileId: number }>();

const desktopTileItem = ref<DesktopTileItem | null>(null);

function onTileRightClick(event: MouseEvent) {
  if (desktopTileItem.value) {
    event.stopPropagation();
  }

  useInitializeContextMenu(event)
    .tile()
    .initialize(
      {
        Delete: async () => {
          if (!desktopTileItem.value) return;
          await desktopStore.deleteDesktopItem(rayDb, desktopTileItem.value.tileId);
        },
      },
      {
        openFileExplorerLocation: async () => {
          if (!desktopTileItem.value?.path) return;

          useOpenFileExplorerWindowByPath(desktopTileItem.value.path);
        },
      },
    );
}

onMounted(() => updateTile());

watch(
  () => [desktopStore.items, useBrowserStore().height],
  () => updateTile(),
);

function updateTile() {
  const desktopItem = desktopStore.getDesktopItemByTileId(tileId);
  if (!desktopItem) {
    desktopTileItem.value = null;
    return;
  }

  desktopTileItem.value = desktopItem;
}

const onDragStart = (event: DragEvent) => {
  if (desktopTileItem.value) useHandleDesktopTileDragStart(event, desktopTileItem.value);
};

const onDrop = async (event: DragEvent) => {
  emit('dragEnded');
  await useHandleDesktopTileDrop(event, desktopTileItem.value, rayDb);
};

async function openWindow() {
  if (!desktopTileItem.value) return;
  await useHandleDesktopFileClicked(desktopTileItem.value, rayDb);
}
</script>
<template>
  <div
    :id="tileId.toString()"
    class="tile"
    :class="{ filled: desktopTileItem !== null }"
    :style="{ width: `${desktopStore.tileWidth}px`, height: `${desktopStore.tileHeight}px` }"
    :draggable="desktopTileItem !== null"
    @dragstart="onDragStart"
    @dragover.prevent
    @dragenter.prevent
    @mousedown="desktopTileItem !== null ? emit('dragStarted') : undefined"
    @mouseup="desktopTileItem !== null ? emit('dragEnded') : undefined"
    @drop.prevent="onDrop"
    @click="useDblClick(() => openWindow())"
    @contextmenu.prevent="onTileRightClick"
  >
    <div class="content" v-if="desktopTileItem && desktopTileItem.id">
      <component
        :is="useGetSvgByDesktopTileItem(desktopTileItem)"
        :custom-width="35"
        :custom-height="35"
      />
      <div>{{ desktopTileItem.label }}</div>
    </div>
  </div>
</template>
<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 5px;
  padding: 5px;
}

.tile.filled:hover {
  background-color: var(--button-hover-color);
}

.content {
  text-align: center;
  font-size: var(--font-size-sm);
}
</style>
