<script setup lang="ts">
import { useDesktopStore } from '@/stores/desktop.ts';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { computed, onMounted, ref, watch } from 'vue';
import { type FileSystemItem, isImageType, isVideoType, type Item } from '@/types/ItemTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useBrowserStore } from '@/stores/browser.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { useMultiSelectionBoxStore } from '@/stores/multiSelectionBox.ts';
import { useHandleDesktopFileClicked } from '@/composables/desktop/useHandleDesktopFileClicked.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const emits = defineEmits(['dragStarted', 'dragEnded']);

const { tilePosition } = defineProps<{ tilePosition: { x: number; y: number } }>();
const verticalTileCount = useTileCountGrid().y;
const tileId = computed(() => (tilePosition.x - 1) * verticalTileCount.value + tilePosition.y);

const tileItem = ref<(Item & { tileId: number }) | null>();
const desktopStore = useDesktopStore();
function onTileRightClick(event: MouseEvent) {
  if (tileContainsContent.value) {
    event.stopPropagation();
  }

  useInitializeContextMenu(event)
    .tile()
    .initialize(
      {
        Copy: () => {
          console.log('copy');
        },
        Paste: () => {
          console.log('paste');
        },
        Delete: async () => {
          if (!tileItem.value) {
            return;
          }

          await desktopStore.deleteDesktopItem(rayDb, tileItem.value.id);
        },
      },
      {
        test: () => {
          console.log('test');
        },
        properties: () => {
          console.log('properties');
        },
      },
    );
}

onMounted(async () => await updateTile());
watch(
  () => desktopStore.items,
  (newValue) => {
    const item = newValue.find((item) => item.tileId === tileId.value);
    if (!item) {
      tileItem.value = null;
      return;
    }

    tileItem.value = item;
  },
);

watch(
  () => useBrowserStore().height,
  () => {
    const item = desktopStore.items.find((item) => item.tileId === tileId.value);
    if (!item) {
      tileItem.value = null;
      return;
    }

    tileItem.value = item;
  },
);

async function updateTile() {
  const desktopItem = await desktopStore.getDesktopItemByTileId(rayDb, tileId.value);

  if (desktopItem) {
    const file = await rayDb.findOne<Item>('files', 'id', desktopItem.id);
    if (!file) {
      return;
    }

    tileItem.value = { ...file, tileId: tileId.value } as Item & { tileId: number };
  }
}

const tileContainsContent = computed(() => {
  if (!tileItem.value || !tileItem.value.content) {
    return false;
  }

  return true;
});

const multiSelectionBoxStore = useMultiSelectionBoxStore();

function onDragStart(event: DragEvent) {
  const id = tileItem.value?.id;
  if (!id) {
    return;
  }

  event?.dataTransfer?.setData('text/plain', id.toString());
}

async function onDrop(event: DragEvent) {
  emits('dragEnded');
  const targetId = Number((event.currentTarget as HTMLElement).id);

  const data = event.dataTransfer?.getData('text/plain');
  if (!data) {
    return;
  }

  const parsedData = JSON.parse(data);
  if (parsedData instanceof Object) {
    const fileSystemItem = parsedData as FileSystemItem;
    const type = fileSystemItem.type;
    const id =
      type === 'application' || type === 'file'
        ? fileSystemItem.file?.id
        : type === 'directory'
          ? fileSystemItem.id
          : null;

    if (id === null) {
      return;
    }

    await desktopStore.addDesktopItem(rayDb, {
      id: Number(id),
      tileId: targetId,
      type: type as 'application' | 'file' | 'directory',
    });

    return;
  }

  const sourceId = Number(data);
  if (!sourceId) {
    return;
  }

  const sourceItem: Item | undefined = desktopStore.items.find((item) => item.id === sourceId);
  if (!sourceItem) {
    return;
  }

  if (sourceId === -1) {
    return;
  }

  await desktopStore.updateDesktopItem(rayDb, sourceItem.id, targetId);
}

async function openWindow() {
  if (!tileItem.value) return;
  await useHandleDesktopFileClicked(tileItem.value, rayDb);
}

const tile = ref();

const isSelected = computed(() => {
  const box = multiSelectionBoxStore.multiSelectionVariables;

  if (!tile.value || !box.isSelecting || !tileContainsContent.value) return false;

  const rect = tile.value.getBoundingClientRect();

  return !(
    box.left + box.width < rect.left ||
    box.left > rect.right ||
    box.top + box.height < rect.top ||
    box.top > rect.bottom
  );
});

const imageSvg = useSvgOrFallback('ImageViewer');
const videoSvg = useSvgOrFallback('VideoPlayer');
const fileSvg = useSvgOrFallback('TextFile');
const directorySvg = useSvgOrFallback('Directory');

function getSvg() {
  if (!tileItem.value) {
    return;
  }

  switch (tileItem.value.content.type) {
    case 'application': {
      if (tileItem.value.label) {
        return useSvgOrFallback(tileItem.value.label).svg;
      } else {
        return fileSvg.svg;
      }
    }
    case 'file': {
      if (isImageType(tileItem.value.content.rawFile?.type)) {
        return imageSvg.svg;
      }
      if (isVideoType(tileItem.value.content.rawFile?.type)) {
        return videoSvg.svg;
      }

      return fileSvg.svg;
    }
    case 'directory': {
      return directorySvg.svg;
    }
    default: {
      return fileSvg.svg;
    }
  }
}
</script>

<template>
  <div
    :id="tileId.toString()"
    class="tile"
    ref="tile"
    :class="{
      filled: tileContainsContent,
      'no-hover': multiSelectionBoxStore.multiSelectionVariables.isSelecting,
      selected: isSelected,
    }"
    :style="{ width: `${desktopStore.tileWidth}px`, height: `${desktopStore.tileHeight}px` }"
    :draggable="tileContainsContent"
    @dragstart="onDragStart"
    @dragover.prevent
    @dragenter.prevent
    @mousedown="tileContainsContent ? emits('dragStarted') : undefined"
    @mouseup="tileContainsContent ? emits('dragEnded') : undefined"
    @drop.prevent="onDrop"
    @click="useDblClick(() => openWindow())"
    @contextmenu.prevent="onTileRightClick"
  >
    <div class="content" v-if="tileItem && tileItem.id">
      <component :is="getSvg()" :custom-width="35" :custom-height="35" />
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
  border-radius: 5px;
  padding: 5px;
}

.tile.filled:not(.no-hover):hover {
  background-color: var(--button-hover-color);
}

.tile.selected {
  background-color: rgba(68, 170, 255, 0.15);
  border: 1px solid #4af;
  border-radius: 0;
}

.content {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-color);
}
</style>
