<script setup lang="ts">
import GridMain from '@/components/GridMain.vue';
import TaskbarMain from '@/components/TaskbarMain.vue';
import { type ComputedRef } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/useFlatOpenWindowsReferencesFull.ts';

const references: ComputedRef<WindowReference[]> = useFlatOpenWindowsReferencesFull();
</script>

<template>
  <main>
    <WindowMain
      v-for="reference of references"
      :key="`${reference.label}-${reference.id}`"
      :reference="reference"
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
