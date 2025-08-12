<script setup lang="ts">
import {
  type FileSystemItem,
  type FileItem,
  fileExtensions,
  type ItemInsert,
} from '@/types/ItemTypes.ts';
import { computed } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import type {
  PrimaryActionsContextMenu,
  SecondaryActionsContextMenu
} from '@/types/ContextMenuTypes.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type ItemSize, itemSizes } from '@/types/FileExplorerTypes.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useToastStore } from '@/stores/toast.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const { currentDirectories, parentId } = defineProps<{
  currentDirectories: Array<FileSystemItem & { type: string }>;
  parentId: number;
}>();

const emits = defineEmits(['itemEvent:dblClick', 'addNewDirectory']);

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
        await useDeleteFileSystemItem(rayDb, item);
        useContextMenuStore().hide();
      }
    },
  };
};

const contextMenuStore = useContextMenuStore();

async function onRightClick(
  event: MouseEvent,
  item: FileSystemItem | null,
  calledFrom: 'grid' | 'gridItem',
) {
  contextMenuStore.initializeContextMenu(
    calledFrom === 'grid' ? primaryActionsGrid : primaryActionsGridItem,
    calledFrom === 'grid' ? secondaryActionsGrid : secondaryActionsGridItem,
    { left: event.clientX, top: event.clientY },
    calledFrom === 'grid' ? actionsGrid() : actionsGridItem(item),
  );

  contextMenuStore.show();
}

const fileSvg = useSvgOrFallback('TextFile');
const directorySvg = useSvgOrFallback('Directory');

function getSvg(fileSystemItem: FileSystemItem & { type: string }) {
  switch (fileSystemItem.type) {
    case 'application': {
      if (fileSystemItem.file?.name) {
        return useSvgOrFallback(fileSystemItem.file.name).svg;
      } else {
        return fileSvg.svg;
      }
    }
    case 'file': {
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

async function onFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0];
  if (!file) {
    return;
  }

  if (!Object.keys(fileExtensions).includes(file.type)) {
    return;
  }

  const fileObject: FileItem = {
    type: 'file',
    name: file.name,
    size: file.size,
    createdAt: file.lastModified.toString(),
    rawFile: file,
  };

  if (parentId === -1) {
    return;
  }

  try {
    const fileId = await rayDb.insertOne<ItemInsert>('files', {
      label: file.name,
      content: fileObject as FileItem,
    });
    if (fileId && typeof fileId === 'number') {
      await insertItemIntoFileSystem(rayDb, [parentId], { file: { name: file.name, id: fileId } });
    }
  } catch (e) {
    useToastStore().createToast((e as Error).message, 'error', 5000, 'desktop');
  }
}

function onDragStart(event: DragEvent, fileSystemItem: FileSystemItem) {
  if (fileSystemItem.file) {
    event.dataTransfer?.setData(
      'text/plain',
      `file-${fileSystemItem.file.id.toString()}`
    );
  } else if (fileSystemItem.directory && fileSystemItem.id) {
    event.dataTransfer?.setData(
      'text/plain',
      `directory-${fileSystemItem.id}`
    );
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
        draggable="true"
        @dragstart="onDragStart($event, fileSystemItem)"
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
