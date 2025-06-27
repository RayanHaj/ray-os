<script setup lang="ts">
import { type Component, type PropType, type Ref, ref, watch } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/WindowTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import WindowHeader from '@/components/WindowHeader.vue';
import { useWindowStylesManager } from '@/composables/useWindowStylesManager.ts';
import { useWindowStateManager } from '@/composables/useWindowStateManager.ts';
import { useWindowPositionManager } from '@/composables/useWindowPositionManager.ts';
import { useWindowResizeManager } from '@/composables/useWindowResizeManager.ts';
import { useWindowSnappingManager } from '@/composables/useWindowSnappingManager.ts';

const props = defineProps({
  reference: { required: true, type: Object as PropType<WindowFlatReference> },
  windowContentComponent: { required: true, type: Object as PropType<Component> },
  selectedLayout: {
    required: true,
    type: Object as PropType<{ layout: string; windowId: string }>,
  },
});

const styles: Ref<WindowStyleObject> = ref({
  left: '25%',
  top: '25%',
  width: '50%',
  height: '50%',
  minWidth: '250px',
  minHeight: '50px',
  zIndex: props.reference.zIndex,
  display: 'block',
  cursor: 'auto',
  transition: 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
});

const cachedStyles = ref({ left: '0', top: '0', width: '50%', height: '50%' });

const emits = defineEmits(['showSnapLayout']);
watch(
  () => props.reference.zIndex,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      styles.value.zIndex = newValue;
    }
  },
);

const oldPosition = ref({ clientX: 0, clientY: 0 });

const window = ref();
const windowStateManager = useWindowStateManager(styles, props.reference);
useWindowStylesManager(styles, props.reference, windowStateManager);

const windowSnappingManager = useWindowSnappingManager(styles);
watch(
  () => windowSnappingManager.showSnapLayout.value,
  (newValue) => {
    emits('showSnapLayout', newValue);
  },
);
watch(
  () => props.selectedLayout,
  (value) => {
    if (
      value.layout === '' ||
      value.windowId === '' ||
      value.windowId !== windowStateManager.constructedId ||
      windowStateManager.isMaximized.value
    )
      return;
    windowSnappingManager.snapWindow(value.layout);
    windowStateManager.isSnapped.value = true;
  },
);

const windowResizeManager = useWindowResizeManager(
  styles,
  props.reference,
  window,
  windowStateManager,
);
const windowPositionManager = useWindowPositionManager(
  styles,
  window,
  windowResizeManager.currentCorner,
  windowStateManager,
  windowSnappingManager,
  oldPosition,
);

const windowStore = useWindowStore();
function closeWindow() {
  windowStore.removeOpenWindowReference(props.reference.label, props.reference.id);
}
function minimizeWindow() {
  windowStore.setWindowMinimized(props.reference.label, props.reference.id);
}
function maximizeWindow() {
  windowResizeManager.maximizeWindow(cachedStyles);
}
</script>

<template>
  <div
    class="window"
    ref="window"
    :id="windowStateManager.constructedId"
    :style="{
      ...styles,
      borderRadius:
        windowStateManager.isMaximized.value || windowStateManager.isSnapped.value ? '0px' : '10px',
    }"
    @mousemove="windowResizeManager.onMouseMoveWindow($event)"
    @mousedown="windowResizeManager.onMouseDownWindow()"
  >
    <WindowHeader
      :reference="reference"
      @on-mousedown-header="windowPositionManager.onMouseDownHeader($event)"
      @window-control-close="closeWindow"
      @window-control-maximize="maximizeWindow"
      @window-control-minimize="minimizeWindow"
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
  overflow: hidden;
}
</style>
