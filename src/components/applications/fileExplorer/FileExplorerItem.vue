<script setup lang="ts">
import { useGetIsDisabledItem } from '@/composables/fileExplorer/useGetIsDisabledItem.ts';
import { type FileSystemItem, type FileType, type Item } from '@/types/ItemTypes.ts';
import { computed } from 'vue';
import { useGetSvgByFileSystemItem } from '@/composables/fileExplorer/useGetSvgByFileSystemItem.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/FileExplorerTypes.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { SystemFileDeleteError } from '@/exceptions/SystemFileDeleteError.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';

const { fileSystemItem, currentItems, filterByFileType, isSelected, rayDb, windowId } =
  defineProps<{
    fileSystemItem: FileSystemItem;
    currentItems: Item[];
    filterByFileType: FileType[];
    isSelected: boolean;
    rayDb: RayDb;
    windowId: string;
  }>();

const emit = defineEmits(['onDragStart', 'onDoubleClick', 'onSingleClick', 'renameFile']);

const isItemDisabled = computed(() =>
  useGetIsDisabledItem(fileSystemItem, currentItems, filterByFileType),
);

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);

function onContextMenu(event: MouseEvent) {
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
        Delete: async () => {
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
    :style="{ pointerEvents: isItemDisabled ? 'none' : 'auto', background: isSelected ? 'var(--button-hover-color)' : 'transparent' }"
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

.item:hover {
  background: var(--button-hover-color) !important;
}

.file-name {
  text-align: center;
}
</style>
