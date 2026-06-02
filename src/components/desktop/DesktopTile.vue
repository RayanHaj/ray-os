<script setup lang="ts">
import { useDesktopStore } from '@/stores/desktop.ts';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { computed, onMounted, ref, watch } from 'vue';
import {
  type FileSystemItem,
  isAudioType,
  isImageType,
  isVideoType,
  type Item,
} from '@/types/ItemTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useBrowserStore } from '@/stores/browser.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { useMultiSelectionBoxStore } from '@/stores/multiSelectionBox.ts';
import { useHandleDesktopFileClicked } from '@/composables/desktop/useHandleDesktopFileClicked.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFilePropertiesStore } from '@/stores/fileProperties.ts';

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
          useToastFeatureNotImplemented();
        },
        Paste: () => {
          useToastFeatureNotImplemented();
        },
        Delete: async () => {
          if (!tileItem.value) {
            return;
          }

          await desktopStore.deleteDesktopItem(rayDb, tileItem.value.tileId);
        },
      },
      {},
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
    let item: (Item & { tileId: number }) | null = null;

    switch (desktopItem.type) {
      case 'application':
      case 'file':
        {
          const fetchedFile = await rayDb.findOne<Item>('files', 'id', desktopItem.id);
          item = { ...fetchedFile, tileId: tileId.value };
        }
        break;
      case 'directory': {
        const fetchedDirectory = await rayDb.findOne<FileSystemItem>(
          'fileSystem',
          'id',
          desktopItem.id,
        );

        if (!fetchedDirectory.directory) {
          break;
        }

        item = {
          label: fetchedDirectory.directory.name,
          content: fetchedDirectory,
          id: fetchedDirectory.id,
          tileId: tileId.value,
          path: desktopItem.path,
        } as Item & { tileId: number };
      }
    }

    if (!item) {
      return;
    }

    tileItem.value = item;
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
  const type = tileItem.value?.content.type;
  if (!id || !type) return;

  event?.dataTransfer?.setData('text/plain', JSON.stringify({ id, type }));

  const contentEl = (event.currentTarget as HTMLElement).querySelector('.content') as HTMLElement;
  if (!contentEl || !event.dataTransfer) return;

  const clone = contentEl.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.padding = '5px';
  clone.style.borderRadius = '5px';
  document.body.appendChild(clone);

  event.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, clone.offsetHeight / 2);

  requestAnimationFrame(() => document.body.removeChild(clone));
}
async function onDrop(event: DragEvent) {
  emits('dragEnded');

  const targetId = Number((event.currentTarget as HTMLElement).id);
  if (tileItem.value?.content) {
    return;
  }

  const data = event.dataTransfer?.getData('text/plain');
  if (!data) {
    return;
  }

  const parsedData = JSON.parse(data);

  if ('directory' in parsedData || 'file' in parsedData) {
    const fileSystemItem = parsedData as FileSystemItem;
    const type = fileSystemItem.type;

    let id = null;
    switch (type) {
      case 'file':
      case 'application':
        {
          id = fileSystemItem.file?.id;
        }
        break;
      case 'directory':
        {
          id = fileSystemItem.id;
        }
        break;
    }

    if (id === null) return;

    await desktopStore.addDesktopItem(rayDb, {
      id: Number(id),
      tileId: targetId,
      type: type as 'application' | 'file' | 'directory',
      path: fileSystemItem.path,
    });

    return;
  }

  const { id: sourceId, type } = parsedData as { id: number; type: string };
  if (!sourceId || !type) return;

  const sourceItem = desktopStore.items.find(
    (item) => item.id === sourceId && item.content.type === type,
  );

  if (!sourceItem) return;

  await desktopStore.updateDesktopItem(rayDb, sourceItem.id, targetId, type);
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
const audioSvg = useSvgOrFallback('Audio');
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
      if (isAudioType(tileItem.value.content.rawFile?.type)) {
        return audioSvg.svg;
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
  -webkit-user-select: none;
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
