<script setup lang="ts">
import { useGetIsDisabledItem } from '@/composables/fileExplorer/useGetIsDisabledItem.ts';
import { type FileSystemItem, type FileType, type Item } from '@/types/ItemTypes.ts';
import { computed } from 'vue';
import { useGetSvgByFileSystemItem } from '@/composables/fileExplorer/useGetSvgByFileSystemItem.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/FileExplorerTypes.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';

const { fileSystemItem, currentItems, filterByFileType, isSelected } = defineProps<{
  fileSystemItem: FileSystemItem;
  currentItems: Item[];
  filterByFileType: FileType[];
  isSelected: boolean;
  rayDb: RayDb;
  windowId: string;
}>();

const emit = defineEmits([
  'onDragStart',
  'onDoubleClick',
  'onSingleClick',
  'renameFile',
  'onDelete',
  'onAddToMultiSelect',
]);

const isItemDisabled = computed(() =>
  useGetIsDisabledItem(fileSystemItem, currentItems, filterByFileType),
);

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);

function onContextMenu(event: MouseEvent) {
  if (!isSelected) {
    emit('onAddToMultiSelect');
  }

  useInitializeContextMenu(event)
    .fileExplorerGridItem({ renameFile: fileSystemItem?.type === 'application' })
    .initialize(
      {
        Copy: () => {
          useToastFeatureNotImplemented();
        },
        Paste: () => {
          useToastFeatureNotImplemented();
        },
        Delete: () => {
          emit('onDelete');
        },
      },
      {
        renameFile: () => {
          if (fileSystemItem) {
            emit('renameFile', {
              contentType: fileSystemItem.directory ? 'directory' : 'file',
              item: fileSystemItem,
            });
          }
        },
        addToDesktop: () => {},
      },
    );
}

function onClick(event: MouseEvent) {
  if (event.ctrlKey) {
    console.log('aaa');
  }
  useDblClick(
    () => emit('onDoubleClick', event),
    () => emit('onSingleClick', event),
  );
}
</script>
<template>
  <div
    class="item"
    draggable="true"
    :class="{ selected: isSelected }"
    :style="{ pointerEvents: isItemDisabled ? 'none' : 'auto' }"
    @click.stop="onClick"
    @dragstart="emit('onDragStart', $event)"
    @contextmenu.prevent.stop="onContextMenu"
  >
    <component
      class="file-svg"
      :is="useGetSvgByFileSystemItem(fileSystemItem)"
      :custom-width="itemSize.size"
      :custom-height="itemSize.size"
    />
    <p class="file-name">
      {{ fileSystemItem.directory?.name ?? fileSystemItem.file?.name }}
    </p>
  </div>
</template>
<style scoped>
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
  pointer-events: none;
}

.item.selected {
  background-color: var(--button-hover-color);
}

.item:hover {
  background-color: var(--button-hover-color);
}

.file-name {
  text-align: center;
}
</style>
