<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import TaskbarTab from '@/components/taskbar/TaskbarTab.vue';

const { applicationName } = defineProps<{ applicationName: string }>();
const emits = defineEmits(['mouseLeft', 'mouseEntered', 'tabsUnmounted']);

const windowStore = useWindowStore();
const references = computed(() => {
  return windowStore.openWindowsReferences[applicationName];
});

onBeforeUnmount(() => emits('tabsUnmounted'));
</script>

<template>
  <ol
    class="tabs"
    @mouseenter="$emit('mouseEntered')"
    @mouseleave="$emit('mouseLeft')"
  >
    <TaskbarTab
      v-for="reference of references"
      :key="useWindowStore().getGlobalId(applicationName, reference.id)"
      :window-id="useWindowStore().getGlobalId(applicationName, reference.id)"
      :application-name="applicationName"
    />
  </ol>
</template>

<style scoped>
.tabs {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: var(--tabs-background);
  border: var(--window-border-color) solid 2px;
  color: var(--tabs-text);
  border-radius: 5px;
  bottom: 70px;
  padding: 20px;
  width: 200px;
  min-height: 200px;
  max-height: 300px;
  overflow: auto;
}
</style>
