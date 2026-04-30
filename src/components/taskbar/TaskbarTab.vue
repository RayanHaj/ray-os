<script setup lang="ts">
import { type Component, onBeforeMount, shallowRef } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/svg/useSvgByFileNameAndDirectory.ts';

const { windowId } = defineProps<{ windowId: string }>();

const windowStore = useWindowStore();
function closeWindow() {
  windowStore.removeOpenWindowReference(windowId);
}

const closeSvg = shallowRef<Component | null>(null);
onBeforeMount(async () => {
  closeSvg.value = await useSvgByFileNameAndDirectory('Close');
});

function onClickTab() {
  windowStore.setWindowMinimized(windowId);
}
</script>

<template>
  <li class="tab" @click="onClickTab">
    <div>{{ windowId }}</div>
    <button class="close-button" @click.stop="closeWindow">
      <component id="close-svg" :is="closeSvg" :custom-width="15" :custom-height="15" />
    </button>
  </li>
</template>

<style scoped>
.tab {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: calc(100% - 5px);
  background-color: var(--tabs-secondary-background);
  padding: 5px;
  border-radius: 5px;
  cursor: auto;
}

.tab:hover {
  background-color: var(--tabs-hover);
}

.close-button {
  margin: 0;
  padding: 0;
  border: none;
  height: 25px;
  width: 30px;
  background: none;
}

.close-button:hover {
  background-color: var(--button-secondary-color);
}

#close-svg {
  padding-top: 1px;
}
</style>
