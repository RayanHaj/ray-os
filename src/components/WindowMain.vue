<script setup lang="ts">
import { computed, type PropType, ref, watch, watchEffect } from 'vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useWindowStore } from '@/stores/window.ts';
import WindowHeader from '@/components/WindowHeader.vue';
import { useBrowserStore } from '@/stores/browser.ts';

const props = defineProps({
  reference: {
    required: true,
    type: Object as PropType<WindowReference>,
  },
});

const styles = ref({
  left: '0',
  top: '0',
  width: '50%',
  height: '50%',
  zIndex: props.reference.zIndex,
  display: 'block',
});

const cachedStyles = ref({
  left: '0',
  top: '0',
  width: '50%',
  height: '50%',
});

const browserStore = useBrowserStore();
const isMaximized = computed(() => {
  return (
    styles.value.left === '0' &&
    styles.value.top === '0' &&
    styles.value.width === '100%' &&
    styles.value.height === `${browserStore.heightExcTaskbar}px`
  );
});

const constructedId = `${props.reference.label}-${props.reference.id}`;
const oldPosition = ref({
  clientX: 0,
  clientY: 0,
});

const windowStore = useWindowStore();
const windowReference = computed(() =>
  windowStore.openWindowsReferences[props.reference.label].find(
    (reference) => reference.id === props.reference.id,
  ),
);

watch(
  () => windowReference.value?.minimized,
  (minimized) => {
    if (minimized) {
      styles.value.display = 'none';
    } else {
      styles.value.display = 'block';
    }
  },
);

function onMouseDown(event: MouseEvent) {
  event.preventDefault();

  if (isMaximized.value) {
    return;
  }

  //Set initial position on mouse down
  oldPosition.value.clientX = event.clientX;
  oldPosition.value.clientY = event.clientY;

  addEventListener('mousemove', onMouseMove);
  addEventListener('mouseup', onMouseUp);
}

function onMouseUp(event: Event) {
  event.preventDefault();
  removeEventListener('mousemove', onMouseMove);
  removeEventListener('mouseup', onMouseUp);
}

const window = ref();

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  const deltaX = oldPosition.value.clientX - event.clientX;
  const deltaY = oldPosition.value.clientY - event.clientY;

  styles.value.left = `${window.value.offsetLeft - deltaX}px`;
  styles.value.top = `${window.value.offsetTop - deltaY}px`;

  oldPosition.value.clientX = event.clientX;
  oldPosition.value.clientY = event.clientY;
}

function closeWindow() {
  windowStore.removeOpenWindowReference(props.reference.label, props.reference.id);
}

function maximizeWindow() {
  // if already maximized, put window back into its position before it was maximized
  if (isMaximized.value) {
    styles.value.height = cachedStyles.value.height;
    styles.value.width = cachedStyles.value.width;
    styles.value.left = cachedStyles.value.left;
    styles.value.top = cachedStyles.value.top;
    return;
  }

  cacheStyles();
  maximize();
}

function cacheStyles() {
  cachedStyles.value.height = styles.value.height;
  cachedStyles.value.width = styles.value.width;
  cachedStyles.value.left = styles.value.left;
  cachedStyles.value.top = styles.value.top;
}

function maximize() {
  styles.value.width = '100%';
  styles.value.height = `${browserStore.heightExcTaskbar}px`;
  styles.value.left = '0';
  styles.value.top = '0';
}
</script>

<template>
  <div class="window" ref="window" :id="constructedId" :style="styles" @mousedown="onMouseDown">
    <WindowHeader
      :reference="reference"
      @window-control-close="closeWindow"
      @window-control-maximize="maximizeWindow"
      @window-control-minimize="
        windowStore.setWindowMinimized(props.reference.label, props.reference.id)
      "
    />
  </div>
</template>

<style scoped>
.window {
  background-color: var(--window-primary-color);
  position: absolute;
  border: var(--window-border-color) 1px solid;
}
</style>
