<script setup lang="ts">
import DesktopGrid from '@/components/DesktopGrid.vue'
import DesktopTaskbar from '@/components/DesktopTaskbar.vue'

//DEBUG
import { useWindowStore } from '@/stores/window.ts'
import { computed } from 'vue'
import ApplicationWindow from '@/components/ApplicationWindow.vue'

const windowStore = useWindowStore();


const references = computed(() => {
  const referencesList: {id: number, label: string, zIndex: number}[] = [];
  const keys = Object.keys(windowStore.openWindowsReferences);
  keys.forEach(key => {
    windowStore.openWindowsReferences[key].forEach(value => {
      const newObject = {
        id: value.id,
        label: key,
        zIndex: value.zIndex
      };

      referencesList.push(newObject);
    });
  });

  return referencesList;
});
</script>

<template>
  <main>
    <ApplicationWindow
      v-for="reference of references"
      :key="reference.id"
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
