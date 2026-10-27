<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import {
  useFileSystemLookup,
  useParseToPathString,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import {
  type FileItem,
  type FileSystemItem,
  type Item,
  type ItemInsert,
} from '@/types/itemTypes.js';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextmenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { FileItemSizeKey, ModalAction, ModalContentType } from '@/types/fileExplorerTypes.js';
import { useToastStore } from '@/stores/toast.ts';
import { useUpdateItemsByCurrentPath } from '@/composables/fileExplorer/useUpdateItemsByCurrentPath.ts';
import { useHandleExplorerFileClicked } from '@/composables/fileExplorer/useHandleExplorerFileClicked.ts';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';
import { useRenameFile } from '@/composables/fileSystem/useRenameFile.ts';
import { useRenameDirectory } from '@/composables/fileSystem/useRenameDirectory.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';
import { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';

const fileExplorerStore = useFileExplorerStore();
const fileSystemStore = useFileSystemStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const items = ref<FileSystemItem[]>([]);
const path = ref<string[]>([fileSystemStore.ROOT_DIR_NAME]);
const parentId = ref<number>(fileSystemStore.ROOT_DIR_ID);

const isDragging = ref<boolean>(false);

const multiSelect = useMultiSelect<number>();

onBeforeMount(async () => {
  let initPath: string = fileSystemStore.ROOT_DIR_NAME;

  if (fileExplorerStore.filePathAtWindow?.windowId === windowId) {
    path.value = fileExplorerStore.filePathAtWindow.path;
    initPath = useParseToPathString(fileExplorerStore.filePathAtWindow.path);

    fileExplorerStore.filePathAtWindow = { windowId: '', path: [] };
  }

  items.value = await useUpdateItemsByCurrentPath(rayDb, initPath);

  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    if (fileExplorerStore.currentFileItemSize !== (fileItemSize as FileItemSizeKey)) {
      fileExplorerStore.updateItemSize(fileItemSize as FileItemSizeKey);
    }
  }
});

watch(
  () => fileSystemStore.updateFileSystemSignal,
  async () => {
    items.value = await useUpdateItemsByCurrentPath(rayDb, path.value.join('/'));
  },
);

watch(
  () => fileExplorerStore.filePathAtWindow,
  (newVal) => {
    if (newVal && newVal.windowId === windowId) {
      path.value = newVal.path;
      fileSystemStore.updateFileSystem();
    }
  },
);

async function handleBackClick() {
  const cachedPath = [...path.value];
  const previousPath = path.value.pop();

  if (previousPath && previousPath !== fileSystemStore.ROOT_DIR_NAME) {
    items.value = await useUpdateItemsByCurrentPath(rayDb, useParseToPathString(path.value));
    parentId.value = items.value[0].parents[0];
  } else {
    path.value = cachedPath;
  }
}

async function onDblClickItem(item: FileSystemItem & { type: string }) {
  if (!item.id) return;

  if (item.directory) {
    path.value = [...path.value, item.directory.name];
    parentId.value = item.id;
    fileSystemStore.updateFileSystem();
  } else {
    await useHandleExplorerFileClicked(item, parentId, rayDb);
  }
}

const modalOpened = ref(false);
const modalContentType = ref<ModalContentType>('directory');
const modalAction = ref<ModalAction>('add');
const modalItem = ref<FileSystemItem>();

function toggleAddNewItemModal(
  contentType: ModalContentType,
  action: ModalAction,
  item?: FileSystemItem,
) {
  useContextmenuStore().hide();
  modalContentType.value = contentType;
  modalAction.value = action;
  modalItem.value = item;
  modalOpened.value = true;
}

async function handleModalInput(contentType: ModalContentType, action: ModalAction, input: string) {
  switch (action) {
    case 'rename':
      {
        if (!modalItem.value) {
          break;
        }

        switch (contentType) {
          case 'directory':
            {
              const directoryId = modalItem.value.id;
              const directoryItem = await rayDb.findOne<FileSystemItem>(
                'fileSystem',
                'id',
                directoryId,
              );
              await useRenameDirectory(rayDb, directoryItem, input, windowId);
            }
            break;
          case 'file':
            {
              const fileId = modalItem.value.file!.id;
              const fileItem = await rayDb.findOne<Item>('files', 'id', fileId);

              if (!fileItem || fileItem.content.type !== 'file') {
                return;
              }

              await useRenameFile(rayDb, fileItem, input, windowId);
            }
            break;
        }
      }
      break;
    case 'add': {
      try {
        const currentDir = await useFileSystemLookup(rayDb, path.value.join('/'));
        if (!currentDir || currentDir instanceof Error) {
          throw new Error('Could not find current directory');
        }

        const parentId = currentDir.parent.id;
        if (!parentId) return;

        switch (contentType) {
          case 'directory':
            {
              await useInsertFileSystemItem(rayDb, [parentId], {
                directory: { name: input, children: [] },
              });
            }
            break;
          case 'file': {
            const fileName = useSanitizeFileName(input, 'text/plain');

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

            await useInsertFileSystemItem(rayDb, [parentId], {
              file: { name: fileName, id: Number(fileId), type: file.type },
            });
          }
        }
      } catch (e) {
        useToastStore().createToast((e as Error).message, 'error', 5000, 'window', windowId);
      }
    }
  }

  modalOpened.value = false;
}

const fileSelectState = computed(() =>
  fileExplorerStore.fileSelectState.find((element) => element.fileExplorerWindowId === windowId),
);

fileExplorerStore.watchFilesUploadedInWindow(windowId, (files) => onFileUpload(files));

async function onFileUpload(files: File[]) {
  for (const file of files) {
    const rawFile =
      file.type === 'audio/x-m4a'
        ? new File([file], file.name, { type: 'audio/mp4', lastModified: file.lastModified })
        : file;

    const fileObject: FileItem = {
      type: 'file',
      name: file.name,
      size: file.size,
      createdAt: file.lastModified.toString(),
      rawFile: rawFile,
    };

    if (!parentId.value) return;

    try {
      const fileId = await rayDb.insertOne<ItemInsert>('files', {
        label: file.name,
        content: fileObject as FileItem,
      });
      if (fileId && typeof fileId === 'number') {
        await useInsertFileSystemItem(rayDb, [parentId.value], {
          file: { name: file.name, id: fileId, type: file.type },
        });
      }
    } catch (e) {
      useToastStore().createToast((e as Error).message, 'error', 5000, 'window', windowId);
    }
  }
}
</script>

<template>
  <div class="file-explorer">
    <FileExplorerModal
      v-if="modalOpened"
      :title="modalContentType"
      :action="modalAction"
      :file-system-item-title="
        modalItem?.file ? modalItem.file.name : (modalItem?.directory?.name ?? '')
      "
      @modal-event:submit-click="handleModalInput($event.contentType, $event.action, $event.input)"
      @modal-event:cancel-click="modalOpened = false"
    />
    <FileExplorerHeader
      :current-path="path"
      :is-dragging="isDragging"
      :multi-select="multiSelect"
      @header-event:back="handleBackClick"
    />
    <FileExplorerGrid
      :parent-id="parentId"
      :current-file-system-items="items"
      :path="useParseToPathString(path)"
      :is-in-file-select-state="fileSelectState?.active ?? false"
      :filter-by-file-type="fileSelectState?.allowedFileTypes ?? []"
      :multi-select="multiSelect"
      :multi-select-activated="fileSelectState?.multiSelect ?? true"
      @on-drag-start="isDragging = true"
      @on-drag-end="isDragging = false"
      @item-event:dbl-click="onDblClickItem"
      @new-directory="toggleAddNewItemModal($event.contentType, 'add')"
      @new-text-file="toggleAddNewItemModal($event.contentType, 'add')"
      @rename-file="toggleAddNewItemModal($event.contentType, 'rename', $event.item)"
    />
  </div>
</template>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container: fileExplorer / size;
}
</style>
