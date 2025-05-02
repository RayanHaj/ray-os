<script setup lang="ts">
import DesktopGrid from '@/components/DesktopGrid.vue'
import DesktopTaskbar from '@/components/DesktopTaskbar.vue'

//DEBUG
// import { useWindowStore } from '@/stores/window.ts'
//
// const windowStore = useWindowStore();
// for (let i = 0; i < 10; i++) {
//   windowStore.pushOpenWindow('File Explorer');
// }
//
// for (let i = 0; i < 10; i++) {
//   windowStore.pushOpenWindow('Serene Sounds');
// }
//
// windowStore.removeOpenWindowReference('File Explorer', 1001);
</script>

<template>
  <main>
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
