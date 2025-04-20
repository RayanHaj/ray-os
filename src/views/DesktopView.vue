<script setup lang="ts">
import DesktopGrid from '@/components/DesktopGrid.vue'
import DesktopTaskbar from '@/components/DesktopTaskbar.vue'

</script>

<template>
  <main>
    <DesktopGrid/>
    <DesktopTaskbar/>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  background: blue;
}
</style>
