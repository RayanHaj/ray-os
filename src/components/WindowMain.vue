<script setup lang="ts">
import { type Component, computed, type PropType, ref, watch } from 'vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useWindowStore } from '@/stores/window.ts';
import WindowHeader from '@/components/WindowHeader.vue';
import { useBrowserStore } from '@/stores/browser.ts';

const props = defineProps({
  reference: {
    required: true,
    type: Object as PropType<WindowReference>,
  },
  windowContentComponent: {
    required: true,
    type: Object as PropType<Component>,
  },
  selectedLayout: {
    required: true,
    type: Object as PropType<{ layout: string; windowId: string }>,
  },
});

const emits = defineEmits(['showSnapLayout']);

const styles = ref({
  left: '0',
  top: '0',
  width: '50%',
  height: '50%',
  zIndex: props.reference.zIndex,
  display: 'block',
  cursor: 'auto',
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
  if (isMaximized.value || currentCorner.value !== 'default') {
    return;
  }

  //Set initial position on mouse down
  oldPosition.value.clientX = event.clientX;
  oldPosition.value.clientY = event.clientY;

  addEventListener('mousemove', onMouseMove);
  addEventListener('mouseup', onMouseUp);
}

const isDraggingWindow = ref(false);
function onMouseUp(event: Event) {
  event.preventDefault();
  isDraggingWindow.value = false;
  if (showSnapLayout.value) {
    emits('showSnapLayout', { show: false, windowId: constructedId });
    showSnapLayout.value = false;
  }

  removeEventListener('mousemove', onMouseMove);
  removeEventListener('mouseup', onMouseUp);
}

const window = ref();
const showSnapLayout = ref(false);
function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  isDraggingWindow.value = true;

  const deltaX = oldPosition.value.clientX - event.clientX;
  const deltaY = oldPosition.value.clientY - event.clientY;

  styles.value.left = `${window.value.offsetLeft - deltaX}px`;
  styles.value.top = `${window.value.offsetTop - deltaY}px`;

  oldPosition.value.clientX = event.clientX;
  oldPosition.value.clientY = event.clientY;

  if (window.value.getBoundingClientRect().top <= browserStore.heightExcTaskbar / 2) {
    if (!showSnapLayout.value) {
      emits('showSnapLayout', { show: true, windowId: constructedId });
      showSnapLayout.value = true;
    }
  } else {
    if (showSnapLayout.value) {
      emits('showSnapLayout', { show: false, windowId: constructedId });
      showSnapLayout.value = false;
    }
  }
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

const isMouseDown = ref(false);
const currentCorner = ref('');
function onMouseoverWindow(event: MouseEvent) {
  if ((isMouseDown.value && currentCorner.value !== 'default') || isDraggingWindow.value) return;

  const rect = window.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const edgeMargin = 7;
  const cornerMargin = 10;

  const onTopLeft = x <= cornerMargin && y <= cornerMargin;
  const onTopRight = x >= rect.width - cornerMargin && y <= cornerMargin;
  const onBottomLeft = x <= cornerMargin && y >= rect.height - cornerMargin;
  const onBottomRight = x >= rect.width - cornerMargin && y >= rect.height - cornerMargin;

  const onLeft = x <= edgeMargin && y > cornerMargin && y < rect.height - cornerMargin;
  const onRight =
    x >= rect.width - edgeMargin && y > cornerMargin && y < rect.height - cornerMargin;
  const onTop = y <= edgeMargin && x > cornerMargin && x < rect.width - cornerMargin;
  const onBottom =
    y >= rect.height - edgeMargin && x > cornerMargin && x < rect.width - cornerMargin;

  if (onTopLeft) {
    styles.value.cursor = 'nw-resize';
    currentCorner.value = 'north west';
  } else if (onTopRight) {
    styles.value.cursor = 'ne-resize';
    currentCorner.value = 'north east';
  } else if (onBottomLeft) {
    styles.value.cursor = 'sw-resize';
    currentCorner.value = 'south west';
  } else if (onBottomRight) {
    styles.value.cursor = 'se-resize';
    currentCorner.value = 'south east';
  } else if (onLeft) {
    styles.value.cursor = 'w-resize';
    currentCorner.value = 'west';
  } else if (onRight) {
    styles.value.cursor = 'e-resize';
    currentCorner.value = 'east';
  } else if (onTop) {
    styles.value.cursor = 'n-resize';
    currentCorner.value = 'north';
  } else if (onBottom) {
    styles.value.cursor = 's-resize';
    currentCorner.value = 'south';
  } else {
    styles.value.cursor = 'default';
    currentCorner.value = 'default';
  }
}

function onMouseDownWindow() {
  if (currentCorner.value !== 'default') {
    isMouseDown.value = true;
    document.body.style.cursor = styles.value.cursor;

    addEventListener('mousemove', resizeWindow);
    addEventListener('mouseup', onMouseUpWindow);
  }
}

function onMouseUpWindow() {
  isMouseDown.value = false;
  document.body.style.cursor = '';

  removeEventListener('mousemove', resizeWindow);
  removeEventListener('mouseup', onMouseUpWindow);
}

function resizeWindow(event: MouseEvent) {
  const splitValue = currentCorner.value.split(' ');
  if (splitValue.length === 1) {
    resizeWindowOnCornerMouseDown(event, splitValue[0]);
  } else {
    splitValue.forEach((value) => resizeWindowOnCornerMouseDown(event, value));
  }
}

function resizeWindowOnCornerMouseDown(event: MouseEvent, side: string) {
  const rect = window.value.getBoundingClientRect();
  switch (side) {
    case 'north':
      {
        const heightChange = rect.top - event.clientY;
        const newHeight = rect.height + heightChange;

        styles.value.height = `${newHeight}px`;
        styles.value.top = `${event.clientY}px`;
      }
      break;
    case 'east':
      {
        const widthChange = event.clientX - rect.right;
        const newWidth = rect.width + widthChange;

        styles.value.width = `${newWidth}px`;
      }
      break;
    case 'south':
      {
        const heightChange = event.clientY - rect.bottom;
        const newHeight = rect.height + heightChange;

        styles.value.height = `${newHeight}px`;
      }
      break;
    case 'west': {
      const widthChange = rect.left - event.clientX;
      const newWidth = rect.width + widthChange;

      styles.value.width = `${newWidth}px`;
      styles.value.left = `${event.clientX}px`;
    }
  }
}

function snapWindow(position: string) {
  switch (position) {
    case 'left':
      {
        styles.value.left = '0';
        styles.value.height = `${browserStore.heightExcTaskbar}px`;
        styles.value.width = '50%';
        styles.value.top = '0';
      }
      break;
    case 'right':
      {
        styles.value.left = '50%';
        styles.value.height = `${browserStore.heightExcTaskbar}px`;
        styles.value.width = '50%';
        styles.value.top = '0';
      }
      break;
    case 'top-left':
      {
        styles.value.left = '0';
        styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
        styles.value.width = '50%';
        styles.value.top = '0';
      }
      break;
    case 'top-right':
      {
        styles.value.left = '50%';
        styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
        styles.value.width = '50%';
        styles.value.top = '0';
      }
      break;
    case 'bottom-left':
      {
        styles.value.left = '0';
        styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
        styles.value.width = '50%';
        styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
      }
      break;
    case 'bottom-right': {
      styles.value.left = '50%';
      styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
      styles.value.width = '50%';
      styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
    }
  }
}

watch(
  () => props.selectedLayout,
  () => {
    if (
      props.selectedLayout.layout === '' ||
      props.selectedLayout.windowId === '' ||
      props.selectedLayout.windowId !== constructedId
    )
      return;
    snapWindow(props.selectedLayout.layout);
  },
);
</script>

<template>
  <div
    class="window"
    ref="window"
    :id="constructedId"
    :style="styles"
    @mousemove="onMouseoverWindow"
    @mousedown="onMouseDownWindow"
  >
    <WindowHeader
      :reference="reference"
      @onMousedownHeader="onMouseDown"
      @window-control-close="closeWindow"
      @window-control-maximize="maximizeWindow"
      @window-control-minimize="
        windowStore.setWindowMinimized(props.reference.label, props.reference.id)
      "
    />
    <component :is="windowContentComponent" />
  </div>
</template>

<style scoped>
.window {
  height: 100%;
  background-color: var(--window-primary-color);
  position: absolute;
  border: var(--window-border-color) 2px solid;
  user-select: none;
  min-width: 300px;
  min-height: 200px;
}
</style>
