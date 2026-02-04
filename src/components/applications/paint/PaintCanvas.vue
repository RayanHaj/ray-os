<script setup lang="ts">
import { onMounted, ref } from 'vue';

const canvas = ref();
onMounted(() => {
  const ctx = canvas.value.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(20, 100);
  ctx.lineTo(70, 100);
  ctx.stroke();
});
</script>

<template>
  <div class="paint-canvas">
    <canvas ref="canvas" id="canvas"> </canvas>
  </div>
</template>

<style scoped>
.paint-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 10px;
}

#canvas {
  border: var(--window-border-color) 1px solid;
  border-radius: 10px;
  background-color: white;
}
</style>
