<script setup lang="ts">
import PaintCanvas from '@/components/applications/paint/PaintCanvas.vue';
import PaintToolbar from '@/components/applications/paint/PaintToolbar.vue';
</script>

<template>
  <section class="paint">
    <PaintCanvas />
    <PaintToolbar />
  </section>
</template>

<style scoped>
.paint {
  display: flex;
  flex-direction: column;
}
</style>
