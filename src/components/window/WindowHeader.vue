<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import type { WindowFlatReference } from '@/types/windowTypes.js';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.js';
import { useWindowStore } from '@/stores/window';
import { fileExtensions } from '@/types/itemTypes.js';
import { useFileSelectStateGetter } from '@/composables/fileExplorer/useFileSelectStateGetter.js';
import { useBrowserStore } from '@/stores/browser.js';

const {
  windowId,
  reference,
  windowType,
  showNoApplicationSvgsFor = [],
} = defineProps<{
  windowId: string;
  reference: WindowFlatReference;
  windowType?: 'fixed' | 'inline';
  showNoApplicationSvgsFor?: string[];
}>();

const activeActions = ref<('Minimize' | 'Maximize' | 'Close')[]>(['Minimize', 'Maximize', 'Close']);
onBeforeMount(() => {
  if (useBrowserStore().isMobile) {
    activeActions.value = ['Minimize', 'Close']
    return;
  }

  switch (windowType) {
    case 'fixed':
      activeActions.value = ['Minimize', 'Close'];
      break;
    case 'inline':
      activeActions.value = ['Maximize', 'Close'];
  }
});

const windowName = computed(() => {
  const fileSelectStateGetter = useFileSelectStateGetter(windowId).value;

  if (fileSelectStateGetter.active) {
    const stringBuilder = ['select'];

    if (!fileSelectStateGetter.multiSelect) {
      stringBuilder.push('a');
    }

    stringBuilder.push(
      fileSelectStateGetter.allowedFileTypes.map((type) => `.${fileExtensions[type]}`).join('/'),
    );

    if (fileSelectStateGetter.multiSelect) {
      stringBuilder.push('files');
    } else {
      stringBuilder.push('file');
    }

    return stringBuilder.join(' ');
  }

  return reference.label;
});
</script>
<template>
  <header class="window-header" :style="{ height: `${useWindowStore().windowHeaderHeight}px` }">
    <div class="info-wrapper">
      <component
        v-if="!showNoApplicationSvgsFor.includes(reference.label)"
        :is="useSvgOrFallback(reference.label).svg"
      />
      <p class="window-name">
        {{ windowName }}
      </p>
    </div>
    <div
      @mousedown="$emit('onMousedownHeader', $event)"
      @touchstart="$emit('onMousedownHeader', $event)"
      class="drag-zone"
    />
    <div class="window-controls">
      <button
        v-for="action in activeActions"
        :key="action"
        :class="action.toLowerCase()"
        @click="$emit(`windowControl${action}`)"
      >
        <component :is="useSvgOrFallback(action).svg" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.window-header {
  display: flex;
  flex-direction: row;
  padding-left: 10px;
  background-color: var(--window-secondary-color);
  border-bottom: var(--window-border-color) solid 1px;
}

.info-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-lg);
}

.info-wrapper p {
  font-weight: bold;
  min-width: max-content;
}

.window-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.window-controls button {
  background-color: transparent;
  padding: 0;
  width: 35px;
  height: 100%;
  border: none;
  cursor: pointer;
}

.info-wrapper svg,
.window-controls svg {
  width: 15px;
  height: 15px;
}

.drag-zone {
  width: 100%;
}

.minimize:hover,
.maximize:hover {
  background-color: var(--button-hover-color);
}

.close:hover {
  background-color: red;
  border: none;
}
</style>
