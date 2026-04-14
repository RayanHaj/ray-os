<script setup lang="ts">
import { useDesktopStore } from '@/stores/desktop.ts';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { computed, onMounted, ref, watch } from 'vue';
import type { Item } from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useBrowserStore } from '@/stores/browser.ts';
import {
  useInitializeContextMenu
} from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const { tilePosition } = defineProps<{ tilePosition: { x: number; y: number } }>();
const verticalTileCount = useTileCountGrid().y
const tileId = computed(() => (tilePosition.x - 1) * verticalTileCount.value + tilePosition.y);

const tileItem = ref<(Item & { tileId: number }) | null>();
const desktopStore = useDesktopStore();
function onTileRightClick(event: MouseEvent) {
  useInitializeContextMenu(event).tile().initialize(
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

        await desktopStore.deleteDesktopItem(rayDb, tileItem.value.id)
      }
    },
    {
      test: () => {
        console.log('test');
      },
      properties: () => {
        console.log('properties');
      }
    }
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
  () => useBrowserStore().height, () => {
    const item = desktopStore.items.find((item) => item.tileId === tileId.value);
    if (!item) {
      tileItem.value = null;
      return;
    }

    tileItem.value = item;
  }
)


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

function onDragStart(event: DragEvent) {
  const id = tileItem.value?.id;
  if (!id) {
    return;
  }

  event?.dataTransfer?.setData('text/plain', id.toString());
}

async function onDrop(event: DragEvent) {
  const targetId = Number((event.currentTarget as HTMLElement).id);

  const data = event.dataTransfer?.getData('text/plain');
  if (!data) {
    return;
  }

  const fileExplorerData = data.split('-');
  if (fileExplorerData.length === 2) {
    const type = fileExplorerData[0];
    const id = fileExplorerData[1];

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

function openWindow() {
  if (!tileItem.value) return;
  switch (tileItem.value.content.type) {
    case 'application':
      {
        useWindowStore().pushOpenWindowReference(tileItem.value.label);
      }
      break;
    case 'file':
      {
        //IMPLEMENT
        console.log('clicked file');
      }
      break;
    case 'directory': {
      const windowId = useWindowStore().pushOpenWindowReference('File Explorer');
      useFileExplorerStore().setFilePathAtWindow(windowId, tileItem.value.content.path);
    }
  }
}
</script>

<template>
  <div
    :id="tileId.toString()"
    class="tile"
    :class="{ filled: tileContainsContent }"
    :style="{ width: `${desktopStore.tileWidth}px`, height: `${desktopStore.tileHeight}px` }"
    :draggable="tileContainsContent"
    @dragstart="onDragStart"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent="onDrop"
    @click="useDblClick(() => openWindow())"
    @contextmenu.prevent="onTileRightClick"
  >
    <div class="content" v-if="tileItem && tileItem.id">
      <component
        :is="useSvgOrFallback(tileItem.label).svg"
        :custom-width="35"
        :custom-height="35"
      />
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

.tile.filled:hover {
  background-color: var(--button-hover-color);
}

.content {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-color);
}
</style>
