<script setup lang="ts">
import DesktopGrid from '@/components/DesktopGrid.vue'
import DesktopTaskbar from '@/components/DesktopTaskbar.vue'
import { ref } from 'vue'

const taskbarHeight = ref(0);
</script>

<template>
  <main>
    <DesktopGrid :taskbar-height="taskbarHeight" />
    <DesktopTaskbar @height="taskbarHeight = $event" />
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  background: blue;
}
</style>
