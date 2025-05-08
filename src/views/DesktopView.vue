<script setup lang="ts">
import GridMain from '@/components/GridMain.vue';
import TaskbarMain from '@/components/TaskbarMain.vue';
import { type Component, type ComputedRef, ref, shallowRef } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/useFlatOpenWindowsReferencesFull.ts';

import FallbackMain from '@/components/applications/FallbackMain.vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';

const windowContentComponents = shallowRef<{ [componentName: string]: Component }>({
  settings: SettingsMain,
});

const references: ComputedRef<WindowReference[]> = useFlatOpenWindowsReferencesFull();
function getWindowContentComponent(reference: WindowReference): Component {
  const component = windowContentComponents.value[reference.label.toLowerCase()];
  if (!component) {
    return FallbackMain;
  }

  return component;
}

const showSnapLayout = ref<{ show: boolean; windowId: string }>({ show: false, windowId: '' });
const selectedLayout = ref<{ layout: string; windowId: string }>({ layout: '', windowId: '' });
</script>

<template>
  <main>
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
    <GridMain />
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
