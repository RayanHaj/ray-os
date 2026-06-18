<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { type FileItemSizeKey, fileItemSizes } from '@/types/fileExplorerTypes.js';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import { fileExtensions, type FileSystemItem } from '@/types/itemTypes.js';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';

const { currentPath = ['C:/'], isDragging } = defineProps<{
  currentPath?: string[];
  isDragging: boolean;
}>();

const emit = defineEmits(['header-event:back', 'header-event:file-upload']);

const itemSizeKeys = fileItemSizes;
const selectedItemSizeButton = ref<FileItemSizeKey>('small');

const rayDb = useInjectOrThrow<RayDb>('rayDb');

onBeforeMount(() => {
  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    updateSelectedItemSizeButton(fileItemSize as FileItemSizeKey);
  }
});

function updateSelectedItemSizeButton(itemSizeKey: FileItemSizeKey) {
  selectedItemSizeButton.value = itemSizeKey as FileItemSizeKey;
  useFileExplorerStore().updateItemSize(itemSizeKey);
}

async function onDrop(event: DragEvent) {
  try {
    const plainItem = event.dataTransfer?.getData('text/plain');
    if (!plainItem) return;

    const parsedItem = JSON.parse(plainItem);
    if (typeof parsedItem !== 'object') return;

    const dropItem = parsedItem as FileSystemItem;
    if (dropItem.isSystemFile) return;

    await useDeleteFileSystemItem(rayDb, dropItem.id, {
      files: { dontDeleteFromFilesStore: true },
      directories: { onlyDeleteParent: true },
      updateFileSystem: false,
    });

    const parentPath = currentPath.slice(0, -1).join('/') || 'C:';
    const parentDir = await fileSystemLookup(rayDb, parentPath);

    if (!parentDir || parentDir instanceof Error) return;

    const newDirectoryId = await useInsertFileSystemItem(
      rayDb,
      [parentDir.parent.id!],
      dropItem,
      false,
    );

    if (dropItem.directory) {
      for (const childId of dropItem.directory.children) {
        const childItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', childId);
        if (!childItem) continue;

        const oldDirectoryIdIndex = childItem.parents.findIndex(
          (parentId) => parentId === dropItem.id,
        );
        if (oldDirectoryIdIndex === -1) continue;

        childItem.parents[oldDirectoryIdIndex] = newDirectoryId;
        await rayDb.updateOne('fileSystem', childItem);
      }
    }

    emit('header-event:back');
  } catch (e) {
    console.error(e);
  }
}

function onFileUploadChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? [...input.files] : null;
  if (!files || files.length === 0) return;

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
        <label for="file-upload" class="custom-file-upload">Upload files</label>
        <input
          id="file-upload"
          type="file"
          multiple
          :accept="Object.keys(fileExtensions).join(',')"
          @change="onFileUploadChange"
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
  border: var(--input-border-color) solid 1px;
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
