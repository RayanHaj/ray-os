<script setup lang="ts">
import {
  type Component,
  markRaw,
  onBeforeMount,
  type PropType,
  type Raw,
  ref,
  shallowRef,
} from 'vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

const props = defineProps({
  reference: {
    required: true,
    type: Object as PropType<WindowReference>,
  },
});

const windowControlButtons = ref<{ name: string; svg: Raw<Component> | null }[]>([]);
const svg = shallowRef<Component | null>(null);
onBeforeMount(async () => {
  svg.value = await useSvgByFileNameAndDirectory('applications', props.reference.label);

  const buttons = [
    { name: 'Minimize', svg: null },
    { name: 'Maximize', svg: null },
    { name: 'Close', svg: null },
  ];
  windowControlButtons.value = await Promise.all(
    buttons.map(async (button) => {
      const svg = await useSvgByFileNameAndDirectory('ui', button.name);
      return { name: button.name, svg: svg ? markRaw(svg) : null };
    }),
  );
});
</script>

<template>
  <header class="window-header">
    <div class="info-wrapper">
      <component class="svg" :is="svg" :custom-width="15" :custom-height="15" />
      <p class="window-name">{{ reference.label }}</p>
    </div>
    <div :style="{ width: '100%' }" @mousedown="$emit('onMousedownHeader', $event)" />
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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  top: 0;
  width: 100%;
  height: 30px;
  color: var(--text-color);
  background-color: var(--window-secondary-color);
  padding-left: 12px;
  border-bottom: var(--window-border-color) solid 1px;
}

.info-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 13px;
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
