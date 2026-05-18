<script setup lang="ts">
import { type Component, computed, markRaw, onBeforeMount, type Raw, ref, shallowRef } from 'vue';
import type { WindowFlatReference } from '@/types/WindowTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useWindowStore } from '@/stores/window';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { fileExtensions } from '@/types/ItemTypes.ts';

const { windowId, reference, windowType } = defineProps<{
  windowId: string;
  reference: WindowFlatReference;
  windowType?: 'fixed' | 'inline';
}>();

const allowedFileTypes = computed(
  () =>
    useFileExplorerStore().fileSelectState.find(
      (element) => element.fileExplorerWindowId === windowId,
    )?.allowedFileTypes ?? [],
);

const windowControlButtons = ref<{ name: string; svg: Raw<Component> | null }[]>([]);
const svg = shallowRef<Component | null>(null);
onBeforeMount(async () => {
  svg.value = useSvgOrFallback(reference.label).svg;

  const buttons =
    windowType === 'fixed'
      ? [
          { name: 'Minimize', svg: null },
          { name: 'Close', svg: null },
        ]
      : windowType === 'inline'
        ? [
            { name: 'Maximize', svg: null },
            { name: 'Close', svg: null },
          ]
        : [
            { name: 'Minimize', svg: null },
            { name: 'Maximize', svg: null },
            { name: 'Close', svg: null },
          ];

  windowControlButtons.value = await Promise.all(
    buttons.map(async (button) => {
      const svg = useSvgOrFallback(button.name).svg;
      return { name: button.name, svg: svg ? markRaw(svg) : null };
    }),
  );
});
</script>
<template>
  <header class="window-header" :style="{ height: `${useWindowStore().windowHeaderHeight}px` }">
    <div class="info-wrapper">
      <component class="svg" :is="svg" :custom-width="15" :custom-height="15" />
      <p class="window-name">
        {{
          allowedFileTypes.length === 0
            ? reference.label
            : `select a ${allowedFileTypes.map((type) => `.${fileExtensions[type]}`).join('/')} file`
        }}
      </p>
    </div>
    <div
      :style="{ width: '100%' }"
      @mousedown="$emit('onMousedownHeader', $event)"
      @touchstart="$emit('onMousedownHeader', $event)"
    />
    <div class="window-controls">
      <button
        v-for="button of windowControlButtons"
        :key="button.name"
        :id="button.name.toLowerCase()"
        @click="$emit(`windowControl${button.name}`)"
      >
        <component :is="button.svg" :custom-width="15" :custom-height="15" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.window-header {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  top: 0;
  width: 100%;
  color: var(--text-color);
  background-color: var(--window-secondary-color);
  padding-left: 12px;
  border-bottom: var(--window-border-color) solid 1px;
  z-index: 9999;
}

.info-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-lg);
}

.window-name {
  font-weight: bold;
  min-width: max-content;
}

.window-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

button {
  background-color: transparent;
  padding: 0;
  width: 35px;
  height: 100%;
  border: none;
  cursor: pointer;
}

#close:hover {
  background-color: red;
  border: none;
}

#minimize:hover,
#maximize:hover {
  background-color: var(--button-hover-color);
}
</style>
