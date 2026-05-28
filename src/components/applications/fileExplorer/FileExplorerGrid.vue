<script setup lang="ts">
import {
  type FileSystemItem,
  type FileItem,
  fileExtensions,
  type ItemInsert,
  type FileType,
  type Item,
} from '@/types/ItemTypes.ts';
import { computed, ref, watch } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/FileExplorerTypes.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import FileExplorerItem from '@/components/applications/fileExplorer/FileExplorerItem.vue';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const { currentDirectories, path, parentId, filterByFileType } = defineProps<{
  currentDirectories: FileSystemItem[];
  path: string;
  parentId: number;
  filterByFileType: FileType[];
}>();

const emit = defineEmits(['itemEvent:dblClick', 'newDirectory', 'newTextFile', 'renameFile']);

const currentItems = ref<Item[]>([]);

watch(
  () => currentDirectories,
  async () => await updateFilesList(),
);

async function updateFilesList() {
  for (const fileSystemItem of currentDirectories) {
    if (!fileSystemItem.file) {
      continue;
    }

    const file = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
    if (file.content.type === 'file') {
      if (!file.content.rawFile) {
        continue;
      }

      if (currentItems.value.some((listFile) => listFile.id === file.id)) {
        continue;
      }

      currentItems.value.push(file);
    }
  }
}

async function onContextMenu(event: MouseEvent) {
  useInitializeContextMenu(event)
    .fileExplorerGrid()
    .initialize(
      {
        Paste: () => {
          useToastFeatureNotImplemented();
        },
      },
      {
        newDirectory: () => {
          emit('newDirectory', { contentType: 'directory' });
        },
        newTextFile: () => {
          emit('newTextFile', { contentType: 'file' });
        },
      },
    );
}

async function onFileDrop(event: DragEvent) {
  const targetElement = (event.target as Element).closest('div');
  if (targetElement?.className === 'item') {
    try {
      const plainItem = event.dataTransfer?.getData('text/plain');
      if (!plainItem) return;

      const parsedItem = JSON.parse(plainItem);
      if (typeof parsedItem !== 'object') return;

      const dropItem = parsedItem as FileSystemItem;
      if (dropItem.isSystemFile) return;

      const targetElementName = targetElement.innerText;
      const targetElementId = currentDirectories.find(
        (dirEl) => dirEl.directory?.name == targetElementName,
      )?.id;

      if (targetElementId === undefined) {
        return;
      }

      if (targetElementId === dropItem.id) {
        return;
      }

      await insertItemIntoFileSystem(rayDb, [targetElementId], dropItem);
      await useDeleteFileSystemItem(rayDb, dropItem, true, true);
    } catch (e) {
      console.error(e);
    }

    return;
  }

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
      await insertItemIntoFileSystem(rayDb, [parentId], {
        file: { name: file.name, id: fileId, type: file.type },
      });
    }
  } catch (e) {
    useToastStore().createToast((e as Error).message, 'error', 5000, 'desktop');
  }
}

const multiSelect = useMultiSelect<number>();
function onDragStart(event: DragEvent, fileSystemItem: FileSystemItem) {
  if (!multiSelect.isSelected(fileSystemItem.id)) {
   multiSelect.toggle(fileSystemItem.id);
  }
  if (fileSystemItem.directory) {
    fileSystemItem.path = `${path}/${fileSystemItem.directory.name}`;
  }
  event.dataTransfer?.setData('text/plain', JSON.stringify(fileSystemItem));
}

function onItemSingleClick(fileSystemItem: FileSystemItem) {
  multiSelect.toggle(fileSystemItem.id)
}

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);

function onClickGrid() {
  multiSelect.clear();
}
</script>

<template>
  <section
    class="file-explorer-grid"
    @click="onClickGrid"
    @contextmenu.prevent="onContextMenu"
    @dragover.prevent
    @drop.prevent="onFileDrop"
    :style="{ fontSize: `${itemSize.font}px` }"
  >
    <div class="grid-wrapper">
      <FileExplorerItem
        v-for="fileSystemItem in currentDirectories"
        :key="fileSystemItem.id"
        :file-system-item="fileSystemItem"
        :current-items="currentItems"
        :filter-by-file-type="filterByFileType"
        :is-selected="multiSelect.selectedItems.value.has(fileSystemItem.id)"
        :ray-db="rayDb"
        :window-id="windowId"
        @on-double-click="emit('itemEvent:dblClick', fileSystemItem)"
        @on-single-click="onItemSingleClick(fileSystemItem)"
        @on-drag-start="onDragStart($event, fileSystemItem)"
        @rename-file="emit('renameFile', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.file-explorer-grid {
  position: relative;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 0;
  padding-left: 0;
  overflow: auto;
}

.grid-wrapper {
  display: flex;
  flex-wrap: wrap;
  flex: 0;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  padding: 10px;
  height: 100%;
}
</style>
