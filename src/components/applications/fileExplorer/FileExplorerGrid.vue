<script setup lang="ts">
import { type FileSystemItem, type FileType, type Item } from '@/types/itemTypes.js';
import { computed, ref, watch } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/fileExplorerTypes.js';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import FileExplorerItem from '@/components/applications/fileExplorer/FileExplorerItem.vue';
import { useBrowserStore } from '@/stores/browser.ts';
import { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import { useFilePropertiesStore } from '@/stores/fileProperties.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useOnFileDrop } from '@/composables/fileExplorer/useOnFileDrop.ts';
import { useOnDragStart } from '@/composables/fileExplorer/useOnDragStart.ts';
import { useOnDblClickItemInFileSelectState } from '@/composables/fileExplorer/useOnDblClickItemInFileSelectState.js';
import { useOnClickItem } from '@/composables/fileExplorer/useOnClickItem.ts';
import { useOnDeleteItems } from '@/composables/fileExplorer/useOnDeleteItems.ts';
import { useAddOrRemoveFileFromTaskbar } from '@/composables/fileExplorer/useAddOrRemoveFileFromTaskbar.ts';

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

const onFileDrop = async (event: DragEvent) =>
  await useOnFileDrop(event, rayDb, currentFileSystemItems, parentId);

const multiSelect = useMultiSelect<number>();
const onDragStart = (event: DragEvent, fileSystemItem: FileSystemItem) => {
  emit('onDragStart', event);
  useOnDragStart(event, multiSelect, fileSystemItem, path);
};

const onDragEnd = (event: DragEvent) => emit('onDragEnd', event);

const onDblClick = async (_: MouseEvent, fileSystemItem: FileSystemItem) => {
  if (isInFileSelectState && !fileSystemItem.directory) {
    await useOnDblClickItemInFileSelectState(rayDb, multiSelect, windowId);
  } else {
    emit('itemEvent:dblClick', fileSystemItem);
  }

  multiSelect.clear();
};

const onClickItem = (event: MouseEvent, fileSystemItem: FileSystemItem) =>
  useOnClickItem(
    event,
    currentFileSystemItems,
    fileSystemItem,
    multiSelect,
    multiSelectActivated,
    isInFileSelectState,
  );

const onClickGrid = () => multiSelect.clear();

const onItemsDelete = async () =>
  await useOnDeleteItems(rayDb, multiSelect, currentFileSystemItems, windowId);

const onRenameFile = () => {
  const id = multiSelect.getFirst();
  const fileSystemItem = currentFileSystemItems.find((fileSystemItem) => fileSystemItem.id === id);

  if (!fileSystemItem) return;

  emit('renameFile', {
    contentType: fileSystemItem.directory ? 'directory' : 'file',
    item: fileSystemItem,
  });
};

const onGridItemContextMenu = (fileSystemItem: FileSystemItem) => {
  multiSelect.clear();
  multiSelect.toggle(fileSystemItem.id);
};

const selectAllToggle = ref<boolean>(false);
watch(
  () => currentFileSystemItems,
  async () => (selectAllToggle.value = false),
);

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
  const propertiesWindowId = useWindowStore().getNextWindowId('Properties');

  if (fileSystemItem.directory) {
    useFilePropertiesStore().loadFileProperties({
      name: fileSystemItem.directory.name,
      type: 'Directory',
      location: `${path}/${fileSystemItem.directory.name}`,
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
            location: `${path}/${file.label}`,
            windowId: propertiesWindowId,
          });
        }
        break;
      case 'directory':
        {
          useFilePropertiesStore().loadFileProperties({
            name: file.label,
            type: 'Directory',
            location: `${path}/${file.label}`,
            windowId: propertiesWindowId,
          });
        }
        break;
      case 'file': {
        useFilePropertiesStore().loadFileProperties({
          name: file.content.name,
          type: file.content.rawFile?.type as FileType,
          location: `${path}/${file.content.name}`,
          windowId: propertiesWindowId,
        });
      }
    }
  }

  useWindowStore().pushOpenWindowReference('Properties');
}

const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[useFileExplorerStore().currentFileItemSize],
);
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
        :filter-by-file-type="filterByFileType"
        :is-selected="multiSelect.selectedItems.value.has(fileSystemItem.id)"
        :window-id="windowId"
        @on-context-menu="onGridItemContextMenu(fileSystemItem)"
        @on-click="onClickItem($event, fileSystemItem)"
        @on-double-click="onDblClick($event, fileSystemItem)"
        @on-drag-start="onDragStart($event, fileSystemItem)"
        @on-drag-end="onDragEnd($event)"
        @rename-file="onRenameFile"
        @add-to-desktop="console.log('add')"
        @add-to-taskbar="useAddOrRemoveFileFromTaskbar(rayDb, multiSelect, currentFileSystemItems)"
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
  margin-top: 35px;
}

.checkbox-wrapper {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 20px;
  margin: 10px;
  border-radius: 5px;
}

.checkbox-wrapper label {
  font-size: var(--font-size-md);
}
</style>
