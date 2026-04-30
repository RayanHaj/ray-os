<script setup lang="ts">
import {
  type FileSystemItem,
  type FileItem,
  fileExtensions,
  type ItemInsert,
  type FileType,
  type Item,
  isImageType,
  isVideoType,
} from '@/types/ItemTypes.ts';
import { computed, ref, watch } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/FileExplorerTypes.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { SystemFileDeleteError } from '@/exceptions/SystemFileDeleteError.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const { currentDirectories, parentId, filterByFileType } = defineProps<{
  currentDirectories: Array<FileSystemItem & { type: string }>;
  parentId: number;
  filterByFileType: FileType[];
}>();

const files = ref<Item[]>([]);
watch(
  () => currentDirectories,
  async () => {
    await updateFilesList();
  },
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

      if (files.value.some((listFile) => listFile.id === file.id)) {
        continue;
      }

      files.value.push(file);
    }
  }
}

const emits = defineEmits(['itemEvent:dblClick', 'newDirectory', 'newTextFile', 'renameFile']);

async function onRightClick(
  event: MouseEvent,
  item: FileSystemItem | null,
  calledFrom: 'grid' | 'gridItem',
) {
  if (calledFrom === 'grid') {
    useInitializeContextMenu(event)
      .fileExplorerGrid()
      .initialize(
        {},
        {
          newDirectory: () => {
            emits('newDirectory', { contentType: 'directory' });
          },
          newTextFile: () => {
            emits('newTextFile', { contentType: 'text file' });
          },
        },
      );
  } else if (calledFrom === 'gridItem') {
    useInitializeContextMenu(event)
      .fileExplorerGridItem()
      .initialize(
        {
          Copy: () => {},
          Paste: () => {},
          Delete: async () => {
            if (item) {
              if (item.isSystemFile) {
                useToastStore().createToast(
                  'cannot delete system files',
                  'error',
                  5000,
                  'window',
                  windowId,
                );

                return;
              }

              try {
                await useDeleteFileSystemItem(rayDb, item);
              } catch (e) {
                if (e instanceof SystemFileDeleteError) {
                  useToastStore().createToast(
                    'cannot delete system files',
                    'error',
                    5000,
                    'window',
                    windowId,
                  );
                }
              }
            }
          },
        },
        {
          renameFile: () => {
            if (item) {
              emits('renameFile', { contentType: 'text file', item: item });
            }
          },
        },
      );
  }
}

const imageSvg = useSvgOrFallback('ImageViewer');
const videoSvg = useSvgOrFallback('VideoPlayer');
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
      if (isImageType(fileSystemItem.file?.type)) {
        return imageSvg.svg;
      }
      if (isVideoType(fileSystemItem.file?.type)) {
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

async function onFileDrop(event: DragEvent) {
  const targetElement = (event.target as Element).closest('div');
  if (targetElement?.className === 'item') {
    try {
      const plainItem = event.dataTransfer?.getData('text/plain');
      if (plainItem === undefined) {
        return;
      }

      const dropItem = JSON.parse(plainItem);
      const targetElementName = targetElement.innerText;
      const targetElementId = currentDirectories.find(
        (dirEl) => dirEl.directory?.name == targetElementName,
      )?.id;

      if (targetElementId === undefined) {
        return;
      }

      const insertedId = await insertItemIntoFileSystem(rayDb, [targetElementId], dropItem);
      if (insertedId instanceof Error || insertedId === undefined) {
        return;
      }

      await useDeleteFileSystemItem(rayDb, dropItem, false, true);
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

function onDragStart(event: DragEvent, fileSystemItem: FileSystemItem) {
  event.dataTransfer?.setData('text/plain', JSON.stringify(fileSystemItem));
}

function handleDisabledItem(item: FileSystemItem) {
  if (!item.file || filterByFileType.length === 0) {
    return false;
  }

  const file = files.value.find((file) => file.id === item.file?.id);
  if (file?.content.type === 'file') {
    return !filterByFileType.includes(file.content.rawFile?.type as FileType);
  }

  return true;
}

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);
</script>

<template>
  <section
    class="file-explorer-grid"
    ref="gridRef"
    @contextmenu.prevent="onRightClick($event, null, 'grid')"
    @dragover.prevent
    @drop.prevent="onFileDrop"
    :style="{ fontSize: `${itemSize.font}px` }"
  >
    <div class="desktop-grid">
      <div
        class="item"
        :style="{ pointerEvents: handleDisabledItem(fileSystemItem) ? 'none' : 'auto' }"
        v-for="fileSystemItem of currentDirectories"
        :key="fileSystemItem.id"
        :draggable="!fileSystemItem.isSystemFile"
        @dragstart="onDragStart($event, fileSystemItem)"
        @click="useDblClick(() => $emit('itemEvent:dblClick', fileSystemItem))"
        @contextmenu.prevent.stop="onRightClick($event, fileSystemItem, 'gridItem')"
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
.item * {
  pointer-events: none;
}

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

.desktop-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  padding: 10px;
  height: 100%;
}

button {
  all: unset;
  display: inline-block;
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
