<script setup lang="ts">
import { useStartMenuStore } from '@/stores/startMenu.ts';
import type { ItemType } from '@/types/ItemTypes.ts';
import { computed } from 'vue';
const { tagValue } = defineProps<{ tagValue: ItemType }>();
const startMenuStore = useStartMenuStore();

function onClickTag() {
  startMenuStore.selectedTag = tagValue
}

const tagIsSelected = computed(() => startMenuStore.selectedTag === tagValue);
</script>

<template>
  <div
    class="start-menu-tag"
    @click="onClickTag"
    :class="{ selected: tagIsSelected }"
  >
    {{ tagValue }}
  </div>
</template>

<style scoped>
.start-menu-tag {
  background-color: var(--button-primary-color);
  color: var(--text-color);
  padding: 10px;
  font-size: var(--font-size-sm);
  border-radius: 10px;
  padding-inline: 20px;
  cursor: default;
}

.start-menu-tag.selected {
  border: var(--input-border-color) 1px solid;
  background-color: var(--button-secondary-color);
}

.start-menu-tag:hover {
  background-color: var(--button-hover-color);
}
</style>
