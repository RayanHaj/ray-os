<script setup lang="ts">
import { type Component, computed, onBeforeMount, provide, type Ref, ref } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/WindowTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import WindowHeader from '@/components/WindowHeader.vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';
import { useWindowPositionManager } from '@/composables/window/useWindowPositionManager.ts';
import { useWindowResizeManager } from '@/composables/window/useWindowResizeManager.ts';
import { useWindowSnappingManager } from '@/composables/window/useWindowSnappingManager.ts';

const { reference, windowContentComponent, isFixed, width, height, minWidth, minHeight } = defineProps<{
  reference: WindowFlatReference;
  windowContentComponent: Component;
  isFixed?: boolean;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}>();

const styles: Ref<WindowStyleObject> = ref({
  left: '25%',
  top: '25%',
  width: width ? width : '50%',
  height: height ? height : '50%',
  minWidth: minWidth ? minWidth : '250px',
  minHeight: minHeight ? minHeight: '50px',
  zIndex: 10,
  display: 'block',
  cursor: 'auto',
  transition: 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
});
const cachedStyles = ref({ left: '0', top: '0', width: '50%', height: '50%' });

const windowStateManager = useWindowStateManager(styles, reference);
onBeforeMount(() => {
  provide('windowId', windowStateManager.windowId);
});

useWindowSnappingManager(styles, windowStateManager.windowId, windowStateManager, isFixed);

const windowRef = ref();
const windowResizeManager = useWindowResizeManager(styles, windowRef, windowStateManager, isFixed);
const windowPositionManager = useWindowPositionManager(
  styles,
  windowRef,
  windowStateManager,
  windowResizeManager.currentCorner,
  isFixed
);

function onMousedownHeader(event: MouseEvent) {
  windowPositionManager.onMouseDownHeader(event);
}

const windowStore = useWindowStore();
function closeWindow() {
  windowStore.removeOpenWindowReference(windowStateManager.windowId);
}

function minimizeWindow() {
  windowStore.setWindowMinimized(windowStateManager.windowId);
}

function maximizeWindow() {
  if (isFixed) return;
  windowResizeManager.setWindowMaximized(cachedStyles);
}

const getWindowBorderRadius = computed(() =>
  windowStateManager.isMaximized.value || windowStateManager.isSnapped.value ? '0px' : '10px',
);

const windowContentHeight = computed(() => `calc(100% - ${windowStore.windowHeaderHeight}px`);
const windowContentStyles = { height: windowContentHeight.value, width: '100%', overflow: 'auto' };
</script>

<template>
  <div
    class="window"
    ref="windowRef"
    :id="windowStateManager.windowId"
    :style="{ ...styles, borderRadius: getWindowBorderRadius }"
    @mousemove="windowResizeManager.onMouseMoveWindow($event)"
    @mousedown="windowResizeManager.onMouseDownWindow()"
  >
    <slot />
    <WindowHeader
      :reference="reference"
      :is-fixed="isFixed"
      @on-mousedown-header="onMousedownHeader"
      @window-control-close="closeWindow"
      @window-control-maximize="maximizeWindow"
      @window-control-minimize="minimizeWindow"
    />
    <component :is="windowContentComponent" :style="windowContentStyles" />
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
