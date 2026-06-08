<script setup lang="ts">
import { useGetIsDisabledItem } from '@/composables/fileExplorer/useGetIsDisabledItem.ts';
import { type FileSystemItem, type FileType, type Item } from '@/types/itemTypes.js';
import { computed, ref, watch } from 'vue';
import { useGetSvgByFileSystemItem } from '@/composables/fileExplorer/useGetSvgByFileSystemItem.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/fileExplorerTypes.js';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const { fileSystemItem, filterByFileType, isSelected } = defineProps<{
  fileSystemItem: FileSystemItem;
  filterByFileType: FileType[];
  isSelected: boolean;
  windowId: string;
}>();

// Used to determine if this item should be disabled or not
const currentFileItem = ref<Item | null>(null);
watch(
  () => fileSystemItem,
  async (newFileSystemItem) => {
    if (!newFileSystemItem.file) return;
    currentFileItem.value = await rayDb.findOne<Item>('files', 'id', newFileSystemItem.file.id);
  },
  { immediate: true },
);

const emit = defineEmits([
  'onDragStart',
  'onDragEnd',
  'onClick',
  'onDoubleClick',
  'onSingleClick',
  'renameFile',
  'addToDesktop',
  'onDelete',
  'onContextMenu',
  'properties',
]);

const isItemDisabled = computed(() =>
  useGetIsDisabledItem(currentFileItem.value, filterByFileType),
);

const fileExplorerStore = useFileExplorerStore();
const itemSize = computed<FileItemSizeValue>(
  () => itemSizes[fileExplorerStore.currentFileItemSize],
);

function onContextMenu(event: MouseEvent) {
  if (!isSelected) {
    emit('onContextMenu');
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
          emit('renameFile');
        },
        addToDesktop: () => {
          emit('addToDesktop');
        },
        properties: () => {
          emit('properties');
        },
      },
    );
}

function onClick(event: MouseEvent) {
  emit('onClick', event);
  useContextMenuStore().hide();

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
    @dragend="emit('onDragEnd', $event)"
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
  padding: 10px;
  overflow-wrap: anywhere;
  pointer-events: none;
  border: 1px dashed transparent;
}

.item.selected,
.item.selected:hover {
  border-color: var(--input-border-color);
  background-color: rgba(0, 0, 0, 0.3);
}

.item:hover {
  border-color: white;
  background-color: rgba(0, 0, 0, 0.3);
}

.file-name {
  text-align: center;
}
</style>
