<script setup lang="ts">
import {
  type Component,
  type ComponentPublicInstance,
  computed,
  onBeforeMount,
  onMounted,
  provide,
  ref,
  useTemplateRef,
} from 'vue';
import type {
  WindowComponentExposed,
  WindowControl,
  WindowFlatReference,
  WindowType,
} from '@/types/windowTypes.js';
import { useWindowStore } from '@/stores/window.js';
import WindowHeader from '@/components/window/WindowHeader.vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.js';
import { useWindowPositionManager } from '@/composables/window/useWindowPositionManager.js';
import { useWindowResizeManager } from '@/composables/window/useWindowResizeManager.js';
import { useWindowSnappingManager } from '@/composables/window/useWindowSnappingManager.js';
import { useBrowserStore } from '@/stores/browser.js';
import { useWindowStyleManager } from '@/composables/window/useWindowStyleManager.ts';
import { useConfirmDialogStore } from '@/stores/confirmDialog.ts';

const {
  reference,
  windowContentComponent,
  showSvg,
  width,
  height,
  minWidth,
  minHeight,
  left,
  top,
  windowType,
} = defineProps<{
  reference: WindowFlatReference;
  windowContentComponent: Component;
  showSvg: boolean;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  left?: string;
  top?: string;
  windowType?: WindowType;
}>();

const { styles, cachedStyles } = useWindowStyleManager(
  width,
  height,
  minWidth,
  minHeight,
  left,
  top,
);
const windowStateManager = useWindowStateManager(styles, reference);

const windowStore = useWindowStore();

const windowComponentRef = useTemplateRef<ComponentPublicInstance & WindowComponentExposed>(
  'windowComponent',
);

const disablePointerEvents = ref<boolean>(false);

onBeforeMount(() => {
  provide('windowId', windowStateManager.windowId);
});
onMounted(() => {
  if (useBrowserStore().isMobile) maximizeWindow();

  windowStore.watchWindowControlClickSignal(async (control: WindowControl) => {
    if (!windowRef.value) return;

    const confirmDialogStore = useConfirmDialogStore();

    const rect = windowRef.value.getBoundingClientRect();
    const left = `${rect.left + (rect.width - confirmDialogStore.WIDTH) / 2}px`;
    const top = `${rect.top + (rect.height - confirmDialogStore.HEIGHT) / 2}px`;

    switch (control) {
      case 'Close':
        if (windowComponentRef.value?.onWindowClose) {
          disablePointerEvents.value = true;
          const proceed = await windowComponentRef.value.onWindowClose(left, top);
          if (proceed) {
            closeWindow();
          } else {
            console.log('hi!')
            disablePointerEvents.value = false;
            return;
          }
        }

        return closeWindow();
      case 'Maximize':
        if (windowComponentRef.value?.onWindowMaximized) {
          const proceed = await windowComponentRef.value.onWindowMaximized();
          if (proceed) {
            maximizeWindow();
          } else return;
        }

        return maximizeWindow();
      case 'Minimize':
        if (windowComponentRef.value?.onWindowMinimized) {
          const proceed = await windowComponentRef.value.onWindowMinimized();
          if (proceed) {
            minimizeWindow();
          } else return;
        }

        return minimizeWindow();
    }
  }, windowStateManager.windowId);
});

const windowRef = useTemplateRef('windowRef');
useWindowSnappingManager(
  styles,
  windowStateManager.windowId,
  windowStateManager,
  windowType === 'fixed',
);

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

const onMousedownHeader = (event: MouseEvent) => windowPositionManager.onMouseDownHeader(event);

const closeWindow = () => windowStore.removeOpenWindowReference(windowStateManager.windowId);
const minimizeWindow = () => windowStore.setWindowMinimized(windowStateManager.windowId);
const maximizeWindow = () => {
  if (windowType === 'fixed') return;

  styles.value.cursor = 'default';
  windowResizeManager.setWindowMaximized(cachedStyles);
};

const getWindowBorderRadius = computed(() =>
  windowStateManager.isMaximized.value || windowStateManager.isSnapped.value ? '0px' : '10px',
);

const windowContentHeight = computed(() => `calc(100% - ${windowStore.windowHeaderHeight}px`);
const windowContentStyles = { height: windowContentHeight.value, width: '100%' };

provide('pointerEventsDisabled', disablePointerEvents);
</script>

<template>
  <div
    class="window"
    ref="windowRef"
    :id="windowStateManager.windowId"
    :style="{
      ...styles,
      borderRadius: getWindowBorderRadius,
      pointerEvents: disablePointerEvents ? 'none' : 'auto',
    }"
    @mousemove="windowResizeManager.onMouseMoveWindow($event)"
    @mousedown="windowResizeManager.onMouseDownWindow"
  >
    <slot />
    <WindowHeader
      :window-id="windowStateManager.windowId"
      :reference="reference"
      :window-type="windowType"
      :show-svg="showSvg"
      @on-mousedown-header="onMousedownHeader($event as MouseEvent)"
      @window-control-clicked="
        (control) => {
          switch (control) {
            case 'Close':
              return closeWindow();
            case 'Maximize':
              return maximizeWindow();
            case 'Minimize':
              return minimizeWindow();
          }
        }
      "
    />
    <component
      ref="windowComponent"
      :is="windowContentComponent"
      :style="windowContentStyles"
      :window-styles="styles"
    />
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
  border: var(--window-border-color) 1px solid;
}
</style>
