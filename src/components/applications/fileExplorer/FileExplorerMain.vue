<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
  parseToPathString,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileItem, FileSystemItem, Item, ItemInsert } from '@/types/ItemTypes.ts';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { FileItemSizeKey, ModalAction, ModalContentType } from '@/types/FileExplorerTypes.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useUpdateItemsByCurrentPath } from '@/composables/fileExplorer/useUpdateItemsByCurrentPath.ts';
import { useHandleExplorerFileClicked } from '@/composables/fileExplorer/useHandleExplorerFileClicked.ts';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';
import { useRenameFile } from '@/composables/fileSystem/useRenameFile.ts';
import { useRenameDirectory } from '@/composables/fileSystem/useRenameDirectory.ts';

const fileExplorerStore = useFileExplorerStore();
const fileSystemStore = useFileSystemStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const items = ref<FileSystemItem[]>([]);
const path = ref<string[]>([fileSystemStore.rootDirectory]);
const parentId = ref<number>();

onBeforeMount(async () => {
  let initPath: string = fileSystemStore.rootDirectory;

  if (fileExplorerStore.filePathAtWindow?.windowId === windowId) {
    path.value = fileExplorerStore.filePathAtWindow.path;
    initPath = parseToPathString(fileExplorerStore.filePathAtWindow.path);

    fileExplorerStore.filePathAtWindow = { windowId: '', path: [] };
  }

  items.value = await useUpdateItemsByCurrentPath(rayDb, initPath);
  parentId.value = fileSystemStore.rootId;

  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    if (fileExplorerStore.currentFileItemSize !== (fileItemSize as FileItemSizeKey)) {
      fileExplorerStore.updateItemSize(fileItemSize as FileItemSizeKey);
    }
  }
});

watch(
  () => fileSystemStore.updateFileSystemVal,
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

  if (previousPath && previousPath !== fileSystemStore.rootDirectory) {
    items.value = await useUpdateItemsByCurrentPath(rayDb, parseToPathString(path.value));
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
  } else if (item.file) {
    await useHandleExplorerFileClicked(item, parentId, rayDb, windowId);
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
  useContextMenuStore().hide();
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
        const currentDir = await fileSystemLookup(rayDb, path.value.join('/'));
        if (!currentDir || currentDir instanceof Error) {
          throw new Error('Could not find current directory');
        }

        const parentId = currentDir.parent.id;
        if (!parentId) return;

        let hasInserted;
        switch (contentType) {
          case 'directory':
            {
              hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], {
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

            hasInserted = await insertItemIntoFileSystem(rayDb, [parentId], {
              file: { name: fileName, id: Number(fileId), type: file.type },
            });
          }
        }

        if (hasInserted instanceof Error) {
          throw hasInserted;
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

function filterByFileType() {
  if (!fileSelectState.value) {
    return [];
  }

  return fileSelectState.value.allowedFileTypes;
}

async function onFileUpload(files: FileList) {
  for (const file of files) {
    const fileObject: FileItem = {
      type: 'file',
      name: file.name,
      size: file.size,
      createdAt: file.lastModified.toString(),
      rawFile: file,
    };

    if (!parentId.value) return;

    try {
      const fileId = await rayDb.insertOne<ItemInsert>('files', {
        label: file.name,
        content: fileObject as FileItem,
      });
      if (fileId && typeof fileId === 'number') {
        await insertItemIntoFileSystem(rayDb, [parentId.value], {
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
      v-show="modalOpened"
      :title="modalContentType"
      :action="modalAction"
      @modal-event:submit-click="handleModalInput($event.contentType, $event.action, $event.input)"
      @modal-event:cancel-click="modalOpened = false"
    />
    <FileExplorerHeader
      :current-path="path"
      @header-event:back="handleBackClick"
      @header-event:file-upload="onFileUpload"
    />
    <FileExplorerGrid
      :parent-id="parentId ?? -1"
      :current-directories="items"
      :path="parseToPathString(path)"
      :filter-by-file-type="filterByFileType()"
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
