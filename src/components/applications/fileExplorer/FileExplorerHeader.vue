<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { type FileItemSizeKey, fileItemSizes } from '@/types/FileExplorerTypes.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import { fileExtensions, type FileSystemItem } from '@/types/ItemTypes.ts';

const { currentPath = ['C:/'] } = defineProps<{ currentPath?: string[] }>();

const emit = defineEmits(['header-event:back', 'header-event:file-upload']);

const directorySvg = useSvgOrFallback('Directory').svg;

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

    await useDeleteFileSystemItem(rayDb, dropItem, true, true, false);

    const parentPath = currentPath.slice(0, -1).join('/') || 'C:';
    const parentDir = await fileSystemLookup(rayDb, parentPath);

    if (!parentDir || parentDir instanceof Error) return;

    const newDirectoryId = await insertItemIntoFileSystem(
      rayDb,
      [parentDir.parent.id!],
      dropItem,
      false,
    );

    if (!newDirectoryId || newDirectoryId instanceof Error) return;

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
    <div class="left-section">
      <button
        class="back-button"
        @click="emit('header-event:back')"
        @drop.prevent="onDrop"
        @dragover.prevent
      >
        ^
      </button>
    </div>
    <div class="middle-section">
      <input type="text" :value="currentPath.join('/')" disabled />
    </div>
    <div class="right-section">
      <label for="file-upload" class="custom-file-upload"> Upload file </label>
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
        v-for="(size, index) of itemSizeKeys"
        :key="size"
        @click="updateSelectedItemSizeButton(size)"
      >
        <component
          :is="directorySvg"
          :style="{ width: `${10 * (index + 1)}px`, height: `${10 * (index + 1)}px` }"
        />
      </button>
    </div>
  </header>
</template>

<style scoped>
.file-explorer-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 50px;
  color: var(--text-color);
}

.left-section,
.back-button {
  width: 150px;
}

.middle-section {
  width: 100%;
}

.back-button {
  background: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
  width: 100%;
  min-width: calc(150px / 3);
  height: 50px;
  color: var(--text-color);
}

input[type='file'] {
  display: none;
}

.right-section {
  display: flex;
  flex-direction: row;
  width: 350px;
}

.right-section label {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
  padding: 10px;
  width: 200px;
}

.item-size-button {
  font-size: var(--font-size-sm);
  width: calc(150px / 3);
  background-color: var(--button-primary-color);
  color: var(--text-color);
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
  color: var(--text-color);
}
</style>
