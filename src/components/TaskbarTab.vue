<script setup lang="ts">
import { type Component, onBeforeMount, type PropType, shallowRef } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

type WindowReference = {
  id: number;
  zIndex: number;
  minimized: boolean;
};

const props = defineProps({
  windowReference: {
    required: true,
    type: Object as PropType<WindowReference>,
  },
  applicationName: {
    required: true,
    type: String,
  },
});

const windowStore = useWindowStore();
function closeWindow() {
  windowStore.removeOpenWindowReference(props.applicationName, props.windowReference.id);
}

const closeSvg = shallowRef<Component | null>(null);
onBeforeMount(async () => {
  closeSvg.value = await useSvgByFileNameAndDirectory('ui', 'Close');
});

function onClickTab() {
  windowStore.setWindowMinimized(props.applicationName, props.windowReference.id);
}
</script>

<template>
  <li class="tab" @click="onClickTab">
    <div>{{ windowReference.id }}: {{ applicationName }}</div>
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
  width: 100%;
  background-color: var(--tabs-secondary-background);
  padding: 10px;
  border-radius: 5px;
  cursor: auto;
  user-select: none;
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
