<script setup lang="ts">
import {
  type FileSystemItem,
  type FileItem,
  type Item,
  fileExtensions,
} from '@/types/ItemTypes.ts';
import { type Component, computed, onBeforeMount, type PropType, shallowRef, watch } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import type {
  SecondaryActionsContextMenu,
  PrimaryActionsContextMenu,
} from '@/types/ContextMenuTypes.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useHandleIDBErrorHandler } from '@/composables/fileSystem/useHandleIDBErrorHandler.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type ItemSize, type ItemSizeKeys, itemSizes } from '@/types/FileExplorerTypes.ts';

const props = defineProps({
  currentDirectories: {
    required: true,
    type: Array as PropType<Array<FileSystemItem & { type: string }>>,
  },
  previousDirectories: { required: true, type: Array as PropType<FileSystemItem[][]> },
  currentPath: { required: true, type: Array as PropType<string[]> },
  rayDb: { required: true, type: Object as PropType<RayDb> },
  parentId: { required: true, type: Number },
});

const emits = defineEmits(['itemEvent:dblClick', 'addNewDirectory']);

const directorySvg = shallowRef<Component | null>();
const fileSvg = shallowRef<Component | null>();

const contextMenuStore = useContextMenuStore();
onBeforeMount(async () => {
  directorySvg.value = useSvgOrFallback('Directory');
  fileSvg.value = useSvgOrFallback('TextFile');
});

const primaryActionsGrid: PrimaryActionsContextMenu[] = [];
const secondaryActionsGrid: SecondaryActionsContextMenu[] = [
  { id: 'newDirectory', label: 'add new directory', disabled: false },
];
const actionsGrid = () => {
  return {
    newDirectory: async () => {
      emits('addNewDirectory');
    },
  };
};

const primaryActionsGridItem: PrimaryActionsContextMenu[] = ['Copy', 'Paste', 'Delete'];
const secondaryActionsGridItem: SecondaryActionsContextMenu[] = [];
const actionsGridItem = (item: FileSystemItem | null) => {
  return {
    Copy: async () => {},
    Delete: async () => {
      if (item) {
        await useDeleteFileSystemItem(props.rayDb, item);
        useContextMenuStore().hide();
      }
    },
  };
};

function onRightClick(
  event: MouseEvent,
  file: FileSystemItem | null,
  calledFrom: 'grid' | 'gridItem',
) {
  contextMenuStore.initializeContextMenu(
    calledFrom === 'grid' ? primaryActionsGrid : primaryActionsGridItem,
    calledFrom === 'grid' ? secondaryActionsGrid : secondaryActionsGridItem,
    { left: event.clientX, top: event.clientY },
    calledFrom === 'grid' ? actionsGrid() : actionsGridItem(file),
  );
  contextMenuStore.show();
}

function getSvg(fileSystemItem: FileSystemItem & { type: string }) {
  switch (fileSystemItem.type) {
    case 'application': {
      if (fileSystemItem.file?.name) {
        return useSvgOrFallback(fileSystemItem.file.name);
      } else {
        return fileSvg.value;
      }
    }
    case 'file': {
      return fileSvg.value;
    }
    case 'directory': {
      return directorySvg.value;
    }
    default: {
      return fileSvg.value;
    }
  }
}

async function onFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0];
  if (!file) {
    return;
  }

  if (!Object.keys(fileExtensions).includes(file.type)) {
    return;
  }

  const FileObject = {
    type: file.type,
    name: file.name,
    size: file.size,
    createdAt: file.lastModified.toString(),
    rawFile: file,
  };

  if (props.parentId === -1) {
    return;
  }

  try {
    const fileId = await props.rayDb.insertOne<Item>('files', {
      label: file.name,
      content: FileObject as FileItem,
    });
    if (fileId && typeof fileId === 'number') {
      await insertItemIntoFileSystem(props.rayDb, [props.parentId], {
        file: { name: file.name, id: fileId },
      });
    }
  } catch (e) {
    useHandleIDBErrorHandler(e as Error);
  }
}

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<ItemSize>(() => itemSizes[fileExplorerStore.currentFileItemSizeKey]);
</script>

<template>
  <section
    class="file-explorer-grid"
    ref="gridRef"
    @click.right.prevent.stop="onRightClick($event, null, 'grid')"
    @dragover.prevent
    @drop.prevent="onFileDrop"
    :style="{ fontSize: `${itemSize.font}px` }"
  >
    <div class="grid">
      <div
        class="item"
        v-for="fileSystemItem of currentDirectories"
        :key="fileSystemItem.id"
        @dblclick="emits('itemEvent:dblClick', fileSystemItem)"
        @click.right.prevent.stop="onRightClick($event, fileSystemItem, 'gridItem')"
      >
        <component
          class="file-svg"
          :is="getSvg(fileSystemItem)"
          :custom-width="itemSize.size"
          :custom-height="itemSize.size"
        />
        <p class="file-name">
          {{ fileSystemItem.directory?.name ?? fileSystemItem.file?.name }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.file-explorer-grid {
  position: relative;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: 0;
  padding-left: 0;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  padding: 10px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  height: max-content;
  width: max-content;
  max-width: 100px;
  color: var(--text-color);
  padding: 10px;
  overflow-wrap: anywhere;
}

.item:hover {
  background: var(--button-hover-color);
}
</style>
