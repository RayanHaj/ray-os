<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileItem, FileSystemItem, FileType, Item, ItemInsert } from '@/types/ItemTypes.ts';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { ItemSizeKeys } from '@/types/FileExplorerTypes.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useNotepadStore } from '@/stores/notepad.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const fileSystemStore = useFileSystemStore();

const currentPath = ref<string[]>([fileSystemStore.rootDirectory]);
const currentItems = ref<Array<FileSystemItem & { type: string }>>([]);
const previousItems = ref<Array<Array<FileSystemItem & { type: string }>>>([]);
const currentItemId = ref<number>();
const isInFileSelectState = ref<{
  value: boolean;
  windowId: string;
  allowedFileTypes: FileType[];
} | null>(null);

const fileExplorerStore = useFileExplorerStore();
onBeforeMount(async () => {
  await updateCurrentItems(fileSystemStore.rootDirectory);
  currentItemId.value = fileSystemStore.rootId;

  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    if (fileExplorerStore.currentFileItemSizeKey !== (fileItemSize as ItemSizeKeys)) {
      fileExplorerStore.updateItemSize(fileItemSize as ItemSizeKeys);
    }
  }

  if (fileExplorerStore.isInFileSelectState?.value) {
    isInFileSelectState.value = fileExplorerStore.isInFileSelectState;
  } else {
    isInFileSelectState.value = null;
  }

  if (fileExplorerStore.filePathAtWindow?.windowId === windowId) {
    currentPath.value = fileExplorerStore.filePathAtWindow.path;
    fileExplorerStore.filePathAtWindow = { windowId: '', path: [] };
  }
});

watch(
  () => fileSystemStore.updateFileSystemVal,
  async () => await updateCurrentItems(currentPath.value.join('/')),
);
const fileExplorerDiv = ref();

const windowId = useInjectOrThrow<string>('windowId');
watch(
  () => fileExplorerStore.filePathAtWindow,
  (newVal) => {
    if (newVal && newVal.windowId === windowId) {
      currentPath.value = newVal.path;
      fileSystemStore.updateFileSystem();
    }
  },
);

async function updateCurrentItems(path: string) {
  const fileSystemItems = await fileSystemLookup(rayDb, path);
  if (fileSystemItems instanceof Error || !fileSystemItems) {
    throw new Error(`No fileSystemItems (children) found with specified path: ${path}`);
  }

  currentItems.value = await mapItemsWithType(fileSystemItems.children);
}

async function mapItemsWithType(items: FileSystemItem[]) {
  return await Promise.all(
    items.map(async (item) => {
      const updatedItems = { ...item, type: 'directory' };

      if (item.file) {
        const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
        updatedItems.type = file.content.type;
      }

      return updatedItems;
    }),
  );
}

function handleBackClick() {
  const poppedItems = previousItems.value.pop();

  if (poppedItems && poppedItems.length > 0) {
    currentItems.value = poppedItems;
    currentItemId.value = currentItems.value[0].parents[0];
    currentPath.value.pop();
  }
}

async function onDblClickItem(item: FileSystemItem & { type: string }) {
  if (item.directory) {
    previousItems.value.push(currentItems.value);
    await updateCurrentItems(`${currentPath.value.join('/')}/${item.directory.name}`);
    currentPath.value.push(item.directory.name);
    currentItemId.value = item.id;
  } else if (item.file) {
    switch (item.type) {
      case 'application':
        useWindowStore().pushOpenWindowReference(item.file.name);
        break;
      case 'file': {
        const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
        if (!file) {
          return;
        }
        if (file.content.type === 'file') {
          if (isInFileSelectState.value?.value) {
            fileExplorerStore.isInFileSelectStateReturnValue = {
              windowId: isInFileSelectState.value.windowId,
              fileId: item.file.id,
              value: file.content,
            };
            return;
          } else if (file.content.rawFile) {
            useNotepadStore().initializeNotepadFile(
              useWindowStore().getNextWindowId('Notepad'),
              item.file.id,
              file.content.name,
              await file.content.rawFile.text(),
            );
            useWindowStore().pushOpenWindowReference('Notepad');
          }
        }
      }
    }

    currentItemId.value = item.id;
  }
}

const modalOpened = ref(false);
const modalContentType = ref<'directory' | 'text file'>('directory');

function toggleAddNewItemModal(contentType: 'directory' | 'text file') {
  useContextMenuStore().hide();
  modalContentType.value = contentType;
  modalOpened.value = true;
}

async function handleModalInput(contentType: 'directory' | 'text file', input: string) {
  const currentPathItemName = currentPath.value[currentPath.value.length - 1];
  const previousItem = previousItems.value[previousItems.value.length - 1];

  try {
    let parentId;
    if (previousItem) {
      parentId = previousItem.find((el) => el.directory?.name === currentPathItemName)?.id ?? null;
    } else {
      const value = await fileSystemLookup(rayDb, fileSystemStore.rootDirectory);
      if (value instanceof Error) {
        throw value;
      }

      parentId = value ? value.parent.id : null;
    }

    if (!parentId) {
      return;
    }

    let hasInserted;
    switch (contentType) {
      case 'directory': {
        hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], {
          directory: { name: input, children: [] },
        });
      } break;
      case 'text file': {
        const createdAt = Date.now();
        const fileName = `${input}.txt`;
        const file = new File([''], fileName, { type: 'text/plain', lastModified: createdAt });

        const item: FileItem = {
          type: 'file',
          name: fileName,
          size: file.size,
          createdAt: file.lastModified.toString(),
          rawFile: file,
        };

        const fileId = await rayDb.insertOne<ItemInsert>('files', {
          label: fileName,
          content: item,
        });

        if (!fileId) {
          return;
        }

        hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], { file: { name: fileName, id: Number(fileId) } });

        useNotepadStore().initializeNotepadFile(useWindowStore().getNextWindowId('Notepad'), Number(fileId), fileName, await file.text());
        useWindowStore().pushOpenWindowReference('Notepad');
      }
    }

    if (hasInserted instanceof Error) {
      throw hasInserted;
    }

    modalOpened.value = false;
  } catch (e) {
    useToastStore().createToast((e as Error).message, 'error', 5000, 'desktop');
  }
}
</script>

<template>
  <div class="file-explorer" ref="fileExplorerDiv">
    <FileExplorerModal
      v-show="modalOpened"
      :title="modalContentType"
      @modal-event:submit-click="handleModalInput($event.contentType, $event.input)"
      @modal-event:cancel-click="modalOpened = false"
    />
    <FileExplorerHeader :current-path="currentPath" @header-event:back="handleBackClick" />
    <FileExplorerGrid
      :parent-id="currentItemId ?? -1"
      :current-directories="currentItems"
      :filter-by-file-type="isInFileSelectState?.allowedFileTypes ?? []"
      @item-event:dbl-click="onDblClickItem"
      @new-directory="toggleAddNewItemModal($event.contentType)"
      @new-text-file="toggleAddNewItemModal($event.contentType)"
    />
  </div>
</template>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
}
</style>
