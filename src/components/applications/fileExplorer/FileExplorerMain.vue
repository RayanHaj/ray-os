<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileItem, FileSystemItem, FileType, ItemInsert } from '@/types/ItemTypes.ts';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { ItemSizeKeys } from '@/types/FileExplorerTypes.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useUpdateItemsByCurrentPath } from '@/composables/fileExplorer/useUpdateItemsByCurrentPath.ts';
import { useHandleExplorerDirectoryClicked } from '@/composables/fileExplorer/useHandleExplorerDirectoryClicked.ts';
import { useHandleExplorerFileClicked } from '@/composables/fileExplorer/useHandleExplorerFileClicked.ts';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const fileSystemStore = useFileSystemStore();

const currentPath = ref<string[]>([fileSystemStore.rootDirectory]);
const currentItems = ref<Array<FileSystemItem & { type: string }>>([]);
const previousItems = ref<Array<Array<FileSystemItem & { type: string }>>>([]);
const currentParentItemId = ref<number>();
const isInFileSelectState = ref<{
  state: boolean;
  windowId: string;
  allowedFileTypes: FileType[];
} | null>(null);

const fileExplorerStore = useFileExplorerStore();
onBeforeMount(async () => {
  await useUpdateItemsByCurrentPath(rayDb, fileSystemStore.rootDirectory, currentItems);
  currentParentItemId.value = fileSystemStore.rootId;

  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    if (fileExplorerStore.currentFileItemSizeKey !== (fileItemSize as ItemSizeKeys)) {
      fileExplorerStore.updateItemSize(fileItemSize as ItemSizeKeys);
    }
  }

  if (fileExplorerStore.isInFileSelectState?.state) {
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
  async () => await useUpdateItemsByCurrentPath(rayDb, currentPath.value.join('/'), currentItems),
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

function handleBackClick() {
  const poppedItems = previousItems.value.pop();

  if (poppedItems && poppedItems.length > 0) {
    currentItems.value = poppedItems;
    currentParentItemId.value = currentItems.value[0].parents[0];
    currentPath.value.pop();
  }
}

async function onDblClickItem(item: FileSystemItem & { type: string }) {
  if (!item.id) return;

  if (item.directory) {
    await useHandleExplorerDirectoryClicked(
      item.id,
      item.directory,
      previousItems,
      currentItems,
      currentParentItemId,
      currentPath,
      rayDb,
    );
  } else if (item.file) {
    await useHandleExplorerFileClicked(item, currentParentItemId, isInFileSelectState, rayDb);
  }
}

const modalOpened = ref(false);
const modalContentType = ref<'directory' | 'text file'>('directory');
const modalAction = ref<'add' | 'rename'>('add');

function toggleAddNewItemModal(contentType: 'directory' | 'text file', item?: FileSystemItem) {
  useContextMenuStore().hide();
  modalContentType.value = contentType;
  modalOpened.value = true;
}

async function handleModalInput(
  contentType: 'directory' | 'text file',
  action: 'add' | 'rename',
  input: string,
) {
  const currentPathItemName = currentPath.value[currentPath.value.length - 1];
  const previousItem = previousItems.value[previousItems.value.length - 1];

  if (action === 'rename') {

  }

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
      case 'directory':
        {
          hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], {
            directory: { name: input, children: [] },
          });
        }
        break;
      case 'text file': {
        const fileName = useSanitizeFileName(input);

        if (!useValidateFileName(fileName, windowId)) {
          return;
        }

        const createdAt = Date.now();
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

        hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], {
          file: { name: fileName, id: Number(fileId) },
        });
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
      :action="modalAction"
      @modal-event:submit-click="handleModalInput($event.contentType, $event.action, $event.input)"
      @modal-event:cancel-click="modalOpened = false"
    />
    <FileExplorerHeader :current-path="currentPath" @header-event:back="handleBackClick" />
    <FileExplorerGrid
      :parent-id="currentParentItemId ?? -1"
      :current-directories="currentItems"
      :filter-by-file-type="isInFileSelectState?.allowedFileTypes ?? []"
      @item-event:dbl-click="onDblClickItem"
      @new-directory="toggleAddNewItemModal($event.contentType)"
      @new-text-file="toggleAddNewItemModal($event.contentType)"
      @rename-file="toggleAddNewItemModal($event.contentType, $event.item)"
    />
  </div>
</template>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
}
</style>
