<script setup lang="ts">
import type { WindowFlatReference } from '@/types/windowTypes.js';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.js';
import { useWindowStore } from '@/stores/window';
import { useWindowControls } from '@/composables/window/useWindowControls.ts';
import { useGetWindowTitle } from '@/composables/window/useGetWindowTitle.ts';

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

const windowTitle = useGetWindowTitle(reference.label, windowId);

const windowControls = useWindowControls();
windowControls.mount(windowType);

</script>
<template>
  <header class="window-header" :style="{ height: `${useWindowStore().windowHeaderHeight}px` }">
    <div class="info-wrapper">
      <component
        v-if="!showNoApplicationSvgsFor.includes(reference.label)"
        :is="useSvgOrFallback(reference.label).svg"
      />
      <p class="window-title">
        {{ windowTitle }}
      </p>
    </div>
    <div
      @mousedown="$emit('onMousedownHeader', $event)"
      @touchstart="$emit('onMousedownHeader', $event)"
      class="drag-zone"
    />
    <div class="window-controls">
      <button
        v-for="action in windowControls.activeWindowControls.value"
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
