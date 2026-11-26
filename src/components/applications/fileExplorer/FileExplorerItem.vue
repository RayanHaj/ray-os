<script setup lang="ts">
import { useGetIsDisabledItem } from '@/composables/fileExplorer/useGetIsDisabledItem.ts';
import { type FileSystemItem, type FileType, isImageType, type Item } from '@/types/itemTypes.js';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useGetSvgByFileSystemItem } from '@/composables/fileExplorer/useGetSvgByFileSystemItem.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { type FileItemSizeValue, itemSizes } from '@/types/fileExplorerTypes.js';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useToastFeatureNotImplemented } from '@/composables/helpers/useToastFeatureNotImplemented.ts';
import { useDblClick } from '@/composables/helpers/UseDblClick.ts';
import { useContextmenuStore } from '@/stores/contextMenu.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useGenerateImageThumbnail } from '@/composables/helpers/useGenerateImageThumbnail.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');
const { fileSystemItem, filterByFileType, isSelected } = defineProps<{
  fileSystemItem: FileSystemItem;
  filterByFileType: FileType[];
  isSelected: boolean;
}>();

const thumbnailURL = ref<string | null>(null);

onBeforeMount(async () => {
  try {
    if (!fileSystemItem.file) return;

    const isImage = isImageType(fileSystemItem.file.type);
    if (!isImage) return;

    const fileItem = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
    if (fileItem.content.type !== 'file') return;

    // const compressedThumbnail = await useGenerateImageThumbnail(fileItem.content.rawFile);
    thumbnailURL.value = URL.createObjectURL(fileItem.content.rawFile);
  } catch (e) {
    console.error('could not find fileItem in RayDB for thumbnail creation');
    thumbnailURL.value = null;
  }
});

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
  'addToTaskbar',
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

const addToTaskbar = !fileSystemItem.file || fileSystemItem.file.type !== 'application';

function onContextMenu(event: MouseEvent) {
  if (!isSelected) {
    emit('onContextMenu');
  }

  useInitializeContextMenu(event)
    .fileExplorerGridItem(
      { renameFile: fileSystemItem?.type === 'application', addToTaskbar: addToTaskbar },
      {
        addToTaskbar: useTaskbarStore().items.some((item) => item.id === fileSystemItem.file?.id)
          ? 'remove from taskbar'
          : undefined,
      },
    )
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
        addToTaskbar: () => {
          emit('addToTaskbar');
        },
        properties: () => {
          emit('properties');
        },
      },
    );
}

function onClick(event: MouseEvent) {
  emit('onClick', event);
  useContextmenuStore().hide();

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
    <img
      v-if="thumbnailURL"
      :src="thumbnailURL"
      :width="`${itemSize.size}px`"
      :height="`${itemSize.size}px`"
      alt="Thumbnail"
      loading="lazy"
      draggable="false"
    />
    <component
      v-else
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
