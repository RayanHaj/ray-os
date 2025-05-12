<script setup lang="ts">
import GridMain from '@/components/GridMain.vue';
import TaskbarMain from '@/components/TaskbarMain.vue';
import { type Component, type ComputedRef, ref, shallowRef, watch } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import type { WindowFlatReference } from '@/types/WindowFlatReference.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/useFlatOpenWindowsReferencesFull.ts';

import FallbackMain from '@/components/applications/FallbackMain.vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
import CalculatorMain from '@/components/applications/calculator/CalculatorMain.vue';
import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';

const windowContentComponents = shallowRef<{ [componentName: string]: Component }>({
  settings: SettingsMain,
  calculator: CalculatorMain,
});

const references: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();
function getWindowContentComponent(reference: WindowFlatReference): Component {
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
