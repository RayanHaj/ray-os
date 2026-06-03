<script setup lang="ts">
import { type Component, computed, onBeforeMount, onMounted, provide, type Ref, ref } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/windowTypes.js';
import { useWindowStore } from '@/stores/window.js';
import WindowHeader from '@/components/window/WindowHeader.vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.js';
import { useWindowPositionManager } from '@/composables/window/useWindowPositionManager.js';
import { useWindowResizeManager } from '@/composables/window/useWindowResizeManager.js';
import { useWindowSnappingManager } from '@/composables/window/useWindowSnappingManager.js';
import { useBrowserStore } from '@/stores/browser.js';

const {
  reference,
  windowContentComponent,
  width,
  height,
  minWidth,
  minHeight,
  windowType,
  showNoApplicationSvgsFor,
} = defineProps<{
  reference: WindowFlatReference;
  windowContentComponent: Component;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  windowType?: 'fixed' | 'inline';
  showNoApplicationSvgsFor: string[];
}>();

const styles: Ref<WindowStyleObject> = ref({
  left: '25%',
  top: '25%',
  width: width ?? '50%',
  height: height ?? '50%',
  minWidth: minWidth ?? '250px',
  minHeight: minHeight ?? '50px',
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

onMounted(() => {
  if (useBrowserStore().isMobile) {
    maximizeWindow();
  }
});

useWindowSnappingManager(
  styles,
  windowStateManager.windowId,
  windowStateManager,
  windowType === 'fixed',
);

const windowRef = ref();
const windowResizeManager = useWindowResizeManager(
  styles,
  windowRef,
  windowStateManager,
  windowType === 'fixed',
);
const windowPositionManager = useWindowPositionManager(
  styles,
  windowRef,
  windowStateManager,
  windowResizeManager.currentCorner,
  windowType === 'fixed',
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
  if (windowType === 'fixed') return;

  styles.value.cursor = 'default';
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
    @mousedown="windowResizeManager.onMouseDownWindow"
  >
    <slot />
    <WindowHeader
      :window-id="windowStateManager.windowId"
      :reference="reference"
      :window-type="windowType"
      :show-no-application-svgs-for="showNoApplicationSvgsFor"
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
  -webkit-user-select: none;
  overflow: hidden;
  background-color: var(--window-primary-color);
  border: var(--window-border-color) 2px solid;
}
</style>
