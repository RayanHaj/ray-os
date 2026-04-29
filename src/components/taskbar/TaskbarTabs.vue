<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import TaskbarTab from '@/components/taskbar/TaskbarTab.vue';
import { useBrowserStore } from '@/stores/browser.ts';

const { applicationName } = defineProps<{ applicationName: string }>();
const emits = defineEmits(['mouseLeft', 'mouseEntered', 'tabsUnmounted']);

const windowStore = useWindowStore();
const references = computed(() => {
  return windowStore.openWindowsReferences[applicationName];
});

onBeforeUnmount(() => emits('tabsUnmounted'));

const tabsRef = ref<HTMLOListElement>();
const tabIsOverflowing = ref<'positive' | 'negative' | ''>('');
onMounted(() => {
  if (tabsRef.value) {
    const rect = tabsRef.value.getBoundingClientRect();

    if (rect.x + rect.width >= useBrowserStore().width) {
      tabIsOverflowing.value = 'positive';
    } else if (rect.x < 0) {
      tabIsOverflowing.value = 'negative';
    } else {
      tabIsOverflowing.value = '';
    }
  }
});

const getTabIsOverflowingStyle = computed(() => {
  if (tabIsOverflowing.value === 'positive') {
    return { right: 0 };
  } else if (tabIsOverflowing.value === 'negative') {
    return { left: 0 };
  }

  return '';
});
</script>

<template>
  <ol
    ref="tabsRef"
    class="tabs"
    :style="getTabIsOverflowingStyle"
    @mouseenter="$emit('mouseEntered')"
    @mouseleave="$emit('mouseLeft')"
  >
    <TaskbarTab
      v-for="reference of references"
      :key="useWindowStore().getWindowId(applicationName, reference.id)"
      :window-id="useWindowStore().getWindowId(applicationName, reference.id)"
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
