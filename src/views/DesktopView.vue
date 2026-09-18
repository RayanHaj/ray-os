<script setup lang="ts">
import { type ComputedRef } from 'vue';
import { type WindowFlatReference } from '@/types/windowTypes';

import DesktopMain from '@/components/desktop/DesktopMain.vue';
import TaskbarMain from '@/components/taskbar/TaskbarMain.vue';
import WindowMain from '@/components/window/WindowMain.vue';

import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import UiToast from '@/ui/UiToast.vue';

import { useWindowStore } from '@/stores/window.js';
import { useContextmenuStore } from '@/stores/contextMenu.js';

import { useFlatOpenWindowsReferencesFull } from '@/composables/window/useFlatOpenWindowsReferencesFull.js';
import { useOnOuterClickClose } from '@/composables/helpers/useOnOuterClickClose.js';
import { useGetWindowContentComponent } from '@/composables/window/useGetWindowContentComponent.js';
import { windowsConfig } from '@/config/windowsConfig.ts';
import { useHandleWallpaper } from '@/composables/desktop/useHandleWallpaper.ts';

const contextMenuStore = useContextmenuStore();
const windowFlatReferences: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();

const { wallpaperUrl } = useHandleWallpaper();

const windowType = (windowName: string): 'fixed' | 'inline' | undefined => {
  const windowConfig = windowsConfig(windowName);

  const fixedSize = windowConfig.getFixedSize();
  if (fixedSize) return 'fixed';

  const isInline = windowConfig.getIsInline();
  if (isInline) return 'inline';
};

const windowWidth = (windowName: string): string | undefined => {
  const width = windowsConfig(windowName).getFixedSize()?.width;
  if (!width) return;

  return `${width}px`;
};

const windowHeight = (windowName: string): string | undefined => {
  const height = windowsConfig(windowName).getFixedSize()?.height;
  if (!height) return;

  return `${height}px`;
};

const windowMinWidth = (windowName: string): string | undefined => {
  const minWidth = windowsConfig(windowName).getMinWidth();
  if (!minWidth) return;

  return `${minWidth}px`;
};

const windowMinHeight = (windowName: string): string | undefined => {
  const minHeight = windowsConfig(windowName).getMinHeight();
  if (!minHeight) return;

  return `${minHeight}px`;
};

const disableWindowControls = (windowName: string) =>
  windowsConfig(windowName).getDisableControls();

const disableIcon = (windowName: string) => windowsConfig(windowName).getDisableIcon();
</script>

<template>
  <main @click="useOnOuterClickClose($event.target as HTMLElement)">
    <UiToast toast-location="desktop" />
    <ContextMenu v-show="contextMenuStore.isShown" />
    <DesktopSnapLayout />
    <WindowMain
      v-for="reference of windowFlatReferences"
      :key="useWindowStore().getWindowId(reference.label, reference.id)"
      :reference="reference"
      :window-content-component="useGetWindowContentComponent(reference.label)"
      :window-type="windowType(reference.label)"
      :width="windowWidth(reference.label)"
      :height="windowHeight(reference.label)"
      :min-width="windowMinWidth(reference.label)"
      :min-height="windowMinHeight(reference.label)"
      :disable-window-controls="disableWindowControls(reference.label)"
      :disable-icon="disableIcon(reference.label)"
      :left="reference.left"
      :top="reference.top"
    >
      <UiToast
        toast-location="window"
        :window-id="useWindowStore().getWindowId(reference.label, reference.id)"
      />
    </WindowMain>
    <DesktopMain :style="{ backgroundImage: wallpaperUrl }" />
    <TaskbarMain />
  </main>
</template>

<style scoped>
main {
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}
</style>
