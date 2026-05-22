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
  <div
    class="tabs-wrapper"
    @mouseenter="$emit('mouseEntered')"
    @mouseleave="$emit('mouseLeft')"
    :style="getTabIsOverflowingStyle"
  >
    <ol ref="tabsRef" class="tabs">
      <TaskbarTab
        v-for="reference of references"
        :key="useWindowStore().getWindowId(applicationName, reference.id)"
        :window-id="useWindowStore().getWindowId(applicationName, reference.id)"
        :application-name="applicationName"
      />
    </ol>
    <button
      class="add-new-instance-button"
      @click="useWindowStore().pushOpenWindowReference(applicationName)"
    >
      New window
    </button>
  </div>
</template>

<style scoped>
.tabs-wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  background-color: var(--tabs-background);
  border: var(--window-border-color) solid 2px;
  color: var(--tabs-text);
  border-radius: 5px;
  bottom: 70px;
  padding: 10px;
  width: 200px;
  min-height: 200px;
  max-height: 300px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  overflow: auto;
}
.add-new-instance-button {
  width: 100%;
  background: var(--button-primary-color);
  color: var(--text-color);
  padding-block: 5px;
  border-radius: 5px;
  border: none;
}

.add-new-instance-button:hover {
  background-color: var(--button-hover-color);
}
</style>
