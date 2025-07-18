<script setup lang="ts">
import DesktopGridMain from '@/components/desktop/DesktopGridMain.vue';
import TaskbarMain from '@/components/taskbar/TaskbarMain.vue';
import { type Component, type ComputedRef, ref } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import { type WindowFlatReference, type WindowName, windowNames } from '@/types/WindowTypes.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/window/useFlatOpenWindowsReferencesFull.ts';

import FallbackMain from '@/components/applications/FallbackMain.vue';
import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useOnOuterClickCloseContextMenu } from '@/composables/contextMenu/useOnOuterClickCloseContextMenu.ts';
import UiToast from '@/ui/UiToast.vue';
import { useGetWindowContentComponent } from '@/composables/window/useGetWindowContentComponent.ts';

const references: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();

function getWindowContentComponent(reference: WindowFlatReference): Component {
  const formattedComponentName =
    reference.label[0].toLowerCase() + reference.label.replace(' ', '').substring(1);
  if (!windowNames.includes(formattedComponentName as WindowName)) {
    return FallbackMain;
  }

  return useGetWindowContentComponent(formattedComponentName as WindowName);
}

const showSnapLayout = ref<{ show: boolean; windowId: string }>({ show: false, windowId: '' });
const selectedLayout = ref<{ layout: string; windowId: string }>({ layout: '', windowId: '' });

const contextMenuStore = useContextMenuStore();
</script>

<template>
  <main @click="useOnOuterClickCloseContextMenu($event.target as HTMLElement)">
    <UiToast />
    <ContextMenu v-show="contextMenuStore.isShown()" />
    <DesktopSnapLayout
      :show-snap-layout="showSnapLayout"
      @selected-layout="selectedLayout = $event"
    />
    <WindowMain
      v-for="reference of references"
      :key="`${reference.label}-${reference.id}`"
      :reference="reference"
      :window-content-component="getWindowContentComponent(reference)"
      :selected-layout="selectedLayout"
      @show-snap-layout="showSnapLayout = $event"
    />
    <DesktopGridMain />
    <TaskbarMain />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  background-color: var(--background-color);
}
</style>
