<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { type FileItemSizeKey, fileItemSizes } from '@/types/fileExplorerTypes.js';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useFileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import { fileExtensions, type FileSystemItem } from '@/types/itemTypes.js';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

const {
  currentPath = ['C:/'],
  isDragging,
  multiSelect,
} = defineProps<{
  currentPath?: string[];
  isDragging: boolean;
  multiSelect: ReturnType<typeof useMultiSelect<number>>;
}>();

const emit = defineEmits(['header-event:back', 'header-event:file-upload']);

const itemSizeKeys = fileItemSizes;
const selectedItemSizeButton = ref<FileItemSizeKey>('small');

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const windowId = ref('');
onBeforeMount(() => {
  windowId.value = useInjectOrThrow<string>('windowId');
  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    updateSelectedItemSizeButton(fileItemSize as FileItemSizeKey);
  }
});

function updateSelectedItemSizeButton(itemSizeKey: FileItemSizeKey) {
  selectedItemSizeButton.value = itemSizeKey as FileItemSizeKey;
  useFileExplorerStore().updateItemSize(itemSizeKey);
}

async function onDrop(_: DragEvent) {
  try {
    await multiSelect.forEachSelected(async (id) => {
      const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', id);

      await useDeleteFileSystemItem(rayDb, id, {
        files: { dontDeleteFromFilesStore: true },
        directories: { onlyDeleteParent: true },
        updateFileSystem: false,
      });

      const parentPath = currentPath.slice(0, -1).join('/') || 'C:';
      const parentDir = await useFileSystemLookup(rayDb, parentPath);

      if (!parentDir || parentDir instanceof Error) return;

      const newDirectoryId = await useInsertFileSystemItem(
        rayDb,
        [parentDir.parent.id!],
        fileSystemItem,
        false,
      );

      if (fileSystemItem.directory) {
        for (const childId of fileSystemItem.directory.children) {
          const childItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', childId);
          if (!childItem) continue;

          const oldDirectoryIdIndex = childItem.parents.findIndex(
            (parentId) => parentId === fileSystemItem.id,
          );
          if (oldDirectoryIdIndex === -1) continue;

          childItem.parents[oldDirectoryIdIndex] = newDirectoryId;
          await rayDb.updateOne('fileSystem', childItem);
        }
      }

      useFileSystemStore().updateFileSystem();

      emit('header-event:back');
    });
  } catch (e) {
    console.error(e);
  }
}

const fileExplorerStore = useFileExplorerStore();
function onFileUploadChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? [...input.files] : null;
  if (!files || files.length === 0) return;

  fileExplorerStore.setFilesUploadedInWindow(windowId.value, files);
  emit('header-event:file-upload', files);
  input.value = '';
}
</script>

<template>
  <header class="file-explorer-header">
    <div class="start-wrapper">
      <div class="left-section">
        <button
          class="back-button"
          @click="emit('header-event:back')"
          @drop.prevent="onDrop"
          @dragover.prevent
        >
          {{ isDragging ? 'Move up' : 'Back' }}
        </button>
      </div>
      <div class="taskbar-tiles-wrapper">
        <input type="text" :value="currentPath.join('/')" disabled />
      </div>
    </div>
    <div class="end-wrapper">
      <div class="clock-wrapper">
        <label
          :for="`file-upload ${windowId}`"
          :style="{ cursor: 'pointer' }"
          class="custom-file-upload"
          >Upload files</label
        >
        <input
          class="file-upload"
          :id="`file-upload ${windowId}`"
          type="file"
          multiple
          :accept="
            [
              ...Object.keys(fileExtensions),
              ...Object.values(fileExtensions).map((ext) => `.${ext}`),
            ].join(',')
          "
          @change="onFileUploadChange"
          @click="console.log(windowId)"
        />
        <button
          class="item-size-button"
          :class="{ selected: size === selectedItemSizeButton }"
          v-for="size in itemSizeKeys"
          :key="size"
          @click="updateSelectedItemSizeButton(size)"
        >
          {{ size[0].toUpperCase() }}
          <!--          <component-->
          <!--            :is="directorySvg"-->
          <!--            :style="{ width: `${10 * (index + 1)}px`, height: `${10 * (index + 1)}px` }"-->
          <!--          />-->
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.file-explorer-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 50px;
  font-size: var(--font-size-lg);
}

.start-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
}

.end-wrapper {
  display: flex;
  width: 350px;
}

.left-section,
.back-button {
  width: 150px;
}

.taskbar-tiles-wrapper {
  width: 100%;
}

.back-button {
  background: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
  width: 100%;
  min-width: calc(150px / 3);
  height: 100%;
}

input[type='file'] {
  display: none;
}

.clock-wrapper {
  display: flex;
  flex-direction: row;
  width: 350px;
}

.clock-wrapper label {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
  padding: 10px;
  width: 200px;
}

.item-size-button {
  width: calc(150px / 3);
  min-width: calc(125px / 3);
  background-color: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
}

.item-size-button:hover {
  background-color: var(--button-hover-color);
}

.item-size-button.selected {
  background-color: var(--button-hover-color);
}

input {
  border-radius: unset;
  border: var(--window-border-color) 1px solid;
  background: var(--input-primary-color);
  width: 100%;
  height: 100%;
}

@container fileExplorer (max-width: 790px) {
  .file-explorer-header {
    flex-direction: column;
    height: 100px;
  }

  .end-wrapper {
    width: 100%;
  }

  .clock-wrapper {
    width: 100%;
  }

  .clock-wrapper label {
    width: 100%;
  }
}
</style>
