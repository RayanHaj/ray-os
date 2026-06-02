<script setup lang="ts">
import {
  fileExtensions,
  type FileItem,
  type FileSystemItem,
  type FileType,
  type Item,
  type ItemInsert,
} from '@/types/ItemTypes.ts';
import { computed, ref, watch } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import {
  type FileItemSizeValue,
  type FileSelectReturnItem,
  itemSizes,
} from '@/types/FileExplorerTypes.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import FileExplorerItem from '@/components/applications/fileExplorer/FileExplorerItem.vue';
import { SystemFileDeleteError } from '@/exceptions/SystemFileDeleteError.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import { type FileProperties, useFilePropertiesStore } from '@/stores/fileProperties.ts';
import { useWindowStore } from '@/stores/window.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const {
  currentFileSystemItems,
  path,
  parentId,
  isInFileSelectState,
  filterByFileType,
  multiSelectActivated,
} = defineProps<{
  currentFileSystemItems: FileSystemItem[];
  path: string;
  parentId: number;
  isInFileSelectState: boolean;
  filterByFileType: FileType[];
  multiSelectActivated: boolean;
}>();

const emit = defineEmits([
  'itemEvent:dblClick',
  'newDirectory',
  'newTextFile',
  'renameFile',
  'onDragStart',
  'onDragEnd',
]);

const currentItems = ref<Item[]>([]);

watch(
  () => currentFileSystemItems,
  async () => await updateFilesList(),
);

async function updateFilesList() {
  for (const fileSystemItem of currentFileSystemItems) {
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
      const targetElementId = currentFileSystemItems.find(
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
  emit('onDragStart', event);

  if (!multiSelect.isSelected(fileSystemItem.id)) {
    multiSelect.clear();
    multiSelect.toggle(fileSystemItem.id);
  }
  if (fileSystemItem.directory) {
    fileSystemItem.path = `${path}/${fileSystemItem.directory.name}`;
  }

  if (multiSelect.size() > 1) {
    const el = document.createElement('div');
    el.innerText = multiSelect.size().toString();

    el.style.width = '75px';
    el.style.height = '75px';
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.border = '1px dashed var(--input-border-color)';
    el.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    el.style.color = 'var(--text-color)';
    el.style.textAlign = 'end';
    el.style.paddingInline = '5px';
    document.body.appendChild(el);

    event.dataTransfer?.setDragImage(el, 75 / 2, 75 / 2);

    requestAnimationFrame(() => document.body.removeChild(el));
  }

  event.dataTransfer?.setData('text/plain', JSON.stringify(fileSystemItem));
}

function onDragEnd(event: DragEvent) {
  emit('onDragEnd', event);
}

async function onItemDoubleClick(fileSystemItem: FileSystemItem) {
  if (isInFileSelectState && !fileSystemItem.directory) {
    const foundSelectState = useFileExplorerStore().fileSelectState.find(
      (element) => element.fileExplorerWindowId === windowId,
    );

    if (!foundSelectState?.windowId) return;

    const selectedFilesList: FileSelectReturnItem[] = [];
    await multiSelect.forEachSelected(async (value) => {
      const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', value);
      if (!fileSystemItem || !fileSystemItem.file) return;

      const fileItem = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
      if (!fileItem || fileItem.content.type !== 'file') return;

      selectedFilesList.push({
        fileSystemItemId: fileSystemItem.id,
        fileId: fileItem.id,
        fileItem: fileItem.content,
      });
      return;
    });

    useFileExplorerStore().fileSelectReturnValue = [
      ...useFileExplorerStore().fileSelectReturnValue,
      { windowId: foundSelectState.windowId, value: selectedFilesList },
    ];

    return;
  } else {
    emit('itemEvent:dblClick', fileSystemItem);
  }

  multiSelect.clear();
}

function onItemClick(event: MouseEvent, fileSystemItem: FileSystemItem) {
  if ((useBrowserStore().isMobile || !event.ctrlKey) && multiSelectActivated) {
    if (event.shiftKey) {
      const lastSelectedElement = multiSelect.getLast();
      if (lastSelectedElement) {
        const oldSelectedItem = currentFileSystemItems.findIndex(
          (item) => item.id === lastSelectedElement,
        );
        const newSelectedItem = currentFileSystemItems.findIndex(
          (item) => item.id === fileSystemItem.id,
        );

        if (oldSelectedItem !== -1 && newSelectedItem !== -1) {
          if (newSelectedItem > oldSelectedItem) {
            for (let i = oldSelectedItem + 1; i <= newSelectedItem; i++) {
              multiSelect.add(currentFileSystemItems[i].id);
            }
          } else {
            for (let i = oldSelectedItem - 1; i >= newSelectedItem; i--) {
              multiSelect.add(currentFileSystemItems[i].id);
            }
          }
          return;
        }
      }
    }
    if (
      multiSelect.selectedItems.value.size === 1 &&
      multiSelect.selectedItems.value.has(fileSystemItem.id)
    ) {
      return;
    }

    if (!isInFileSelectState) {
      multiSelect.clear();
    }
  }

  if (!multiSelectActivated) {
    multiSelect.clear();
  }

  multiSelect.toggle(fileSystemItem.id);
}

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);

function onClickGrid() {
  multiSelect.clear();
}

function onItemsDelete() {
  multiSelect.forEachSelected(async (id) => {
    const fileSystemItem = currentFileSystemItems.find((item) => item.id === id);
    if (fileSystemItem) {
      if (fileSystemItem.isSystemFile) {
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
        await useDeleteFileSystemItem(rayDb, fileSystemItem);
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
  });
}

function onRenameFile() {
  const fileSystemItemId = multiSelect.getFirst();
  const fileSystemItem = currentFileSystemItems.find(
    (fileSystemItem) => fileSystemItem.id === fileSystemItemId,
  );

  if (!fileSystemItem) return;

  emit('renameFile', {
    contentType: fileSystemItem.directory ? 'directory' : 'file',
    item: fileSystemItem,
  });
}

async function onAddToDesktop() {
  // const fileSystemItemId = multiSelect.getFirst();
  // const fileSystemItem = currentFileSystemItems.find(
  //   (fileSystemItem) => fileSystemItem.id === fileSystemItemId,
  // );
  //
  // if (!fileSystemItem) return;
  //
  // // sort in ascending tileId order
  // const desktopItems = await useDesktopStore()
  //   .getDesktopItems(rayDb)
  //   .then((desktopItems) => desktopItems.sort((a, b) => a.tileId - b.tileId));
  //
  // console.log(desktopItems);
  //
  // let tileId = 1;
  // let previousTileId = -1;
  // if (desktopItems.length > 0) {
  //   for (const desktopItem of desktopItems) {
  //     if (previousTileId === -1 || desktopItem.tileId - 1 === previousTileId) {
  //       previousTileId = desktopItem.tileId;
  //       tileId = previousTileId + 1;
  //     }
  //   }
  // }
  //
  // console.log({
  //   id: fileSystemItem.id,
  //   tileId: tileId,
  //   type: fileSystemItem.type as 'application' | 'file' | 'directory',
  //   path: fileSystemItem.path,
  // });
  //
  // await useDesktopStore().addDesktopItem(rayDb, {
  //   id: fileSystemItem.id ?? fileSystemItem.file?.id,
  //   tileId: tileId,
  //   type: fileSystemItem.type as 'application' | 'file' | 'directory',
  //   path: fileSystemItem.path,
  // });
}

function onGridItemContextMenu(fileSystemItem: FileSystemItem) {
  multiSelect.clear();
  multiSelect.toggle(fileSystemItem.id);
}
const selectAllToggle = ref(false);
watch(selectAllToggle, (newToggledVal) => {
  if (newToggledVal) {
    for (const fileSystemItem of currentFileSystemItems) {
      if (fileSystemItem.file) {
        if (
          !filterByFileType.includes(fileSystemItem.file.type as FileType) &&
          isInFileSelectState
        ) {
          continue;
        }
      }
      multiSelect.add(fileSystemItem.id);
    }
  } else {
    multiSelect.clear();
  }
});

async function onProperties(fileSystemItem: FileSystemItem) {
  const propertiesWindowId = useWindowStore().getNextWindowId('properties');

  if (fileSystemItem.directory) {
    useFilePropertiesStore().loadFileProperties({
      name: fileSystemItem.directory.name,
      type: 'Directory',
      location: path,
      windowId: propertiesWindowId,
    });
  } else if (fileSystemItem.file) {
    const file = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
    if (!file) return;

    switch (file.content.type) {
      case 'application':
        {
          useFilePropertiesStore().loadFileProperties({
            name: file.label,
            type: 'Application',
            location: path,
            windowId: propertiesWindowId,
          });
        }
        break;
      case 'directory':
        {
          useFilePropertiesStore().loadFileProperties({
            name: file.label,
            type: 'Directory',
            location: path,
            windowId: propertiesWindowId,
          });
        }
        break;
      case 'file': {
        useFilePropertiesStore().loadFileProperties({
          name: file.content.name,
          type: file.content.rawFile?.type as FileType,
          location: path,
          windowId: propertiesWindowId,
        });
      }
    }
  }

  useWindowStore().pushOpenWindowReference('properties');
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
    <div class="checkbox-wrapper">
      <input id="select-all-checkbox" type="checkbox" v-model="selectAllToggle" />
      <label for="select-all-checkbox">Select all</label>
    </div>
    <div
      class="grid-wrapper"
      :style="{ padding: useBrowserStore().isMobile ? '10px 75px 10px 10px' : '10px' }"
    >
      <FileExplorerItem
        v-for="fileSystemItem in currentFileSystemItems"
        :key="fileSystemItem.id"
        :file-system-item="fileSystemItem"
        :current-items="currentItems"
        :filter-by-file-type="filterByFileType"
        :is-selected="multiSelect.selectedItems.value.has(fileSystemItem.id)"
        :ray-db="rayDb"
        :window-id="windowId"
        @on-context-menu="onGridItemContextMenu(fileSystemItem)"
        @on-click="onItemClick($event, fileSystemItem)"
        @on-double-click="onItemDoubleClick(fileSystemItem)"
        @on-drag-start="onDragStart($event, fileSystemItem)"
        @on-drag-end="onDragEnd($event)"
        @rename-file="onRenameFile"
        @add-to-desktop="onAddToDesktop"
        @on-delete="onItemsDelete"
        @properties="onProperties(fileSystemItem)"
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
  overflow: auto;
  align-items: start;
  padding: 10px;
}

.grid-wrapper {
  display: flex;
  flex-wrap: wrap;
  flex: 0;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  height: 100%;
  gap: 5px;
}

.checkbox-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 20px;
  border-radius: 5px;
}

.checkbox-wrapper label {
  color: var(--text-color);
  font-size: var(--font-size-md);
}
</style>
