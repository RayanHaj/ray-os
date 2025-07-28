<script setup lang="ts">
import { onBeforeMount, type PropType, ref } from 'vue';
import type { ItemSizeKeys } from '@/types/FileExplorerTypes.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

defineProps({
  currentPath: { required: false, type: Array as PropType<string[]>, default: () => ['C:/'] },
});
const emits = defineEmits(['header-event:back']);
const itemSizeButtonsText: Array<ItemSizeKeys> = ['small', 'medium', 'large'];
const selectedItemSizeButton = ref<ItemSizeKeys>('medium');

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
</script>

<template>
  <header class="file-explorer-header">
    <div class="start">
      <button class="back-button" @click="emits('header-event:back')">^</button>
    </div>
    <div class="middle-side">
      <input type="text" :value="currentPath.join('/')" disabled />
    </div>
    <div class="end">
      <button
        class="item-size-button"
        :class="{ selected: text === selectedItemSizeButton }"
        v-for="text of itemSizeButtonsText"
        :key="text"
        @click="updateSelectedItemSizeButton(text)"
      >
        {{ text }}
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

.start,
.back-button {
  width: 150px;
}

.middle-side {
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

.end {
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
