<script setup lang="ts">
import DesktopGrid from '@/components/DesktopGrid.vue'
import DesktopTaskbar from '@/components/DesktopTaskbar.vue'
import { type ComputedRef, onBeforeMount, onMounted } from 'vue'
import ApplicationWindow from '@/components/ApplicationWindow.vue'
import type { WindowReference } from '@/types/WindowReference.ts'
import { useFlatOpenWindowsReferencesFull } from '@/composables/useFlatOpenWindowsReferencesFull.ts'

const references: ComputedRef<WindowReference[]> = useFlatOpenWindowsReferencesFull();
</script>

<template>
  <main>
    <ApplicationWindow
      v-for="reference of references"
      :key="`${reference.label}-${reference.id}`"
      :reference="reference"
    />
    <DesktopGrid/>
    <DesktopTaskbar/>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  background-color: var(--background-color);
}
</style>
