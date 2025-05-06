<script setup lang="ts">
import GridMain from '@/components/GridMain.vue';
import TaskbarMain from '@/components/TaskbarMain.vue';
import { type Component, type ComputedRef, shallowRef } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/useFlatOpenWindowsReferencesFull.ts';

import FallbackMain from '@/components/applications/FallbackMain.vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
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
</script>

<template>
  <main>
    <WindowMain
      v-for="reference of references"
      :key="`${reference.label}-${reference.id}`"
      :reference="reference"
      :window-content-component="getWindowContentComponent(reference)"
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
