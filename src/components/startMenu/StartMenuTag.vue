<script setup lang="ts">
import { useStartMenuStore } from '@/stores/startMenu.ts';
const { tagValue } = defineProps<{ tagValue: string }>();
const startMenuStore = useStartMenuStore();
</script>

<template>
  <div
    class="start-menu-tag"
    @click="startMenuStore.selectedTag = tagValue"
    :class="{ selected: startMenuStore.selectedTag === tagValue }"
  >
    {{ tagValue }}
  </div>
</template>

<style scoped>
.start-menu-tag {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 10px;
  font-size: var(--font-size-sm);
  border-radius: 10px;
  padding-inline: 20px;
  cursor: default;
}

.start-menu-tag.selected {
  background-color: red;
}
</style>
