<script setup lang="ts">
import DesktopMain from '@/components/desktop/DesktopMain.vue';
import TaskbarMain from '@/components/taskbar/TaskbarMain.vue';
import { type ComputedRef } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import { type WindowFlatReference } from '@/types/WindowTypes.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/window/useFlatOpenWindowsReferencesFull.ts';

import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useOnOuterClickClose } from '@/composables/helpers/useOnOuterClickClose.ts';
import UiToast from '@/ui/UiToast.vue';
import { useGetWindowContentComponent } from '@/composables/window/useGetWindowContentComponent.ts';
import { useWindowStore } from '@/stores/window.ts';

const references: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();
const contextMenuStore = useContextMenuStore();

const fixedSizeWindows: Record<string, { width: number; height: number }> = {
  Doom: { width: 766, height: 507 },
};

const minWidthWindows: Record<string, { width: number }> = { Notepad: { width: 445 } };
const minHeightWindows: Record<string, { height: number }> = { Notepad: { height: 208 } };
</script>

<template>
  <main @click="useOnOuterClickClose($event.target as HTMLElement)">
    <UiToast toast-location="desktop" />
    <ContextMenu v-show="contextMenuStore.isShown()" />
    <DesktopSnapLayout />
    <WindowMain
      v-for="reference of references"
      :key="useWindowStore().getGlobalId(reference.label, reference.id)"
      :reference="reference"
      :window-content-component="useGetWindowContentComponent(reference.label)"
      :is-fixed="fixedSizeWindows[reference.label] !== undefined"
      :width="
        fixedSizeWindows[reference.label]
          ? `${fixedSizeWindows[reference.label].width}px`
          : undefined
      "
      :height="
        fixedSizeWindows[reference.label]
          ? `${fixedSizeWindows[reference.label].height}px`
          : undefined
      "
      :min-width="
        minWidthWindows[reference.label] ? `${minWidthWindows[reference.label].width}px` : undefined
      "
      :min-height="
        minHeightWindows[reference.label]
          ? `${minHeightWindows[reference.label].height}px`
          : undefined
      "
    >
      <UiToast
        toast-location="window"
        :window-id="useWindowStore().getGlobalId(reference.label, reference.id)"
      />
    </WindowMain>
    <DesktopMain />
    <TaskbarMain />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  background-color: var(--background-color);
  //background-image: url('../assets/wallpaper.jpeg');
  //background-position: center;
  //background-repeat: no-repeat;
  //background-size: cover;
}
</style>
