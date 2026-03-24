<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { type ItemSizeKeys, ItemSizeKeysArray } from '@/types/FileExplorerTypes.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';

const { currentPath = ['C:/'], previousItems } = defineProps<{
  currentPath?: string[];
  previousItems: Array<Array<FileSystemItem & { type: string }>>;
}>();

const emits = defineEmits(['header-event:back', 'pushItemToPreviousDirectory']);

const directorySvg = useSvgOrFallback('Directory').svg;

const itemSizeKeys = ItemSizeKeysArray;
const selectedItemSizeButton = ref<ItemSizeKeys>('medium');

const rayDb = useInjectOrThrow<RayDb>('rayDb');

onBeforeMount(() => {
  const fileItemSize = localStorage.getItem('fileItemSize');
  if (fileItemSize) {
    updateSelectedItemSizeButton(fileItemSize as ItemSizeKeys);
  }
});

function updateSelectedItemSizeButton(itemSizeKey: ItemSizeKeys) {
  selectedItemSizeButton.value = itemSizeKey as ItemSizeKeys;
  useFileExplorerStore().updateItemSize(itemSizeKey);
}

async function onDrop(event: DragEvent) {
  if (previousItems.length === 0) {
    return;
  }

  try {
    const previousDirId = previousItems[previousItems.length - 1][0].parents[0];
    const plainItem = event.dataTransfer?.getData('text/plain');
    if (plainItem === undefined) {
      return;
    }

    const dropItem = JSON.parse(plainItem);
    const insertedId = await insertItemIntoFileSystem(rayDb, [previousDirId], dropItem);
    if (insertedId instanceof Error || insertedId === undefined) {
      return;
    }

    await useDeleteFileSystemItem(rayDb, dropItem, undefined, true);

    emits('pushItemToPreviousDirectory', dropItem);
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <header class="file-explorer-header">
    <div class="left-section">
      <button
        class="back-button"
        @click="emits('header-event:back')"
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

.right-section {
  display: flex;
  flex-direction: row;
  width: 150px;
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
