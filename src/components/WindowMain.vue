<script setup lang="ts">
import { type Component, onBeforeMount, provide, type Ref, ref, watch } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/WindowTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import WindowHeader from '@/components/WindowHeader.vue';
import { useWindowStylesManager } from '@/composables/window/useWindowStylesManager.ts';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';
import { useWindowPositionManager } from '@/composables/window/useWindowPositionManager.ts';
import { useWindowResizeManager } from '@/composables/window/useWindowResizeManager.ts';
import { useWindowSnappingManager } from '@/composables/window/useWindowSnappingManager.ts';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';

const { reference, windowContentComponent } = defineProps<{
  reference: WindowFlatReference;
  windowContentComponent: Component;
}>();

const windowStore = useWindowStore();
const windowId = windowStore.getGlobalId(reference.label, reference.id);
onBeforeMount(() => {
  styles.value.zIndex = windowStore.getZIndex(reference.label, reference.id);
  provide('windowId', windowId);
});

watch(
  () => windowStore.zIndexesOrder,
  (newValue, oldValue) => {
    const globalId = windowStore.getGlobalId(reference.label, reference.id);
    const newIndex = newValue.indexOf(globalId);
    const oldIndex = oldValue.indexOf(globalId);
    if (newIndex === oldIndex) {
      return;
    }

    styles.value.zIndex = windowStore.getZIndex(reference.label, reference.id);
  },
);

const styles: Ref<WindowStyleObject> = ref({
  left: '25%',
  top: '25%',
  width: '50%',
  height: '50%',
  minWidth: '250px',
  minHeight: '50px',
  zIndex: 10,
  display: 'block',
  cursor: 'auto',
  transition: 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
});
const cachedStyles = ref({ left: '0', top: '0', width: '50%', height: '50%' });

const oldPosition = ref({ clientX: 0, clientY: 0 });

const window = ref();
const windowStateManager = useWindowStateManager(styles, reference);
const windowSnappingManager = useWindowSnappingManager(styles);
useWindowStylesManager(styles, reference, windowStateManager);

const snapLayoutStore = useSnapLayoutStore();
watch(
  () => snapLayoutStore.currentSnapLayoutSession,
  async (newValue) => {
    if (
      newValue.selectedLayout === '' ||
      newValue.windowId !== windowId ||
      windowStateManager.isMaximized.value
    )
      return;

    windowSnappingManager.snapWindow(newValue.selectedLayout);
    windowStateManager.isSnapped.value = true;
  },
  { deep: true },
);

const windowResizeManager = useWindowResizeManager(styles, windowId, window, windowStateManager);
const windowPositionManager = useWindowPositionManager(
  styles,
  window,
  windowId,
  windowResizeManager.currentCorner,
  windowStateManager,
  oldPosition,
);

function closeWindow() {
  windowStore.removeOpenWindowReference(windowId);
}

function minimizeWindow() {
  windowStore.setWindowMinimized(windowId);
}

function maximizeWindow() {
  windowResizeManager.setWindowMaximized(cachedStyles);
}
</script>

<template>
  <div
    class="window"
    ref="window"
    :id="windowId"
    :style="{
      ...styles,
      borderRadius:
        windowStateManager.isMaximized.value || windowStateManager.isSnapped.value ? '0px' : '10px',
    }"
    @mousemove="windowResizeManager.onMouseMoveWindow($event)"
    @mousedown="windowResizeManager.onMouseDownWindow()"
  >
    <slot />
    <WindowHeader
      :reference="reference"
      @on-mousedown-header="windowPositionManager.onMouseDownHeader($event)"
      @window-control-close="closeWindow"
      @window-control-maximize="maximizeWindow"
      @window-control-minimize="minimizeWindow"
    />
    <component
      :is="windowContentComponent"
      :style="{
        height: `calc(100% - ${windowStore.windowHeaderHeight}px`,
        width: '100%',
        overflow: 'auto',
      }"
    />
  </div>
</template>

<style scoped>
.window {
  height: 100%;
  position: absolute;
  user-select: none;
  overflow: hidden;
  background-color: var(--window-primary-color);
  border: var(--window-border-color) 2px solid;
}
</style>
