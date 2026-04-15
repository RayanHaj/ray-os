<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvas = ref();

const canvasWidth = ref(0);
const canvasHeight = ref(0);

onMounted(() => {
  const parent = canvas.value.parentElement.parentElement;

  function updateSize() {
    canvas.value.width = parent.offsetWidth - 80;
    canvas.value.height = parent.offsetHeight - 80;
    canvasWidth.value = parent.offsetWidth - 80;
    canvasHeight.value = parent.offsetHeight - 80;
  }

  updateSize();

  const observer = new ResizeObserver(() => updateSize());
  observer.observe(parent);

  onUnmounted(() => observer.disconnect());
});

const isPainting = ref(false);
const lineWidth = ref(5);

function onMouseDown(e: MouseEvent) {
  isPainting.value = true;
  const ctx = canvas.value.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function onMouseUp(e: MouseEvent) {
  const ctx = canvas.value.getContext('2d');
  isPainting.value = false;
  ctx.stroke();
  ctx.beginPath();
}

function onMouseMove(e: MouseEvent) {
  if (!isPainting.value) return;

  const ctx = canvas.value.getContext('2d');

  ctx.lineWidth = lineWidth.value;
  ctx.lineCap = 'round';

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}
</script>

<template>
  <div class="paint-canvas">
    <canvas
      ref="canvas"
      id="canvas"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
    />
  </div>
</template>

<style scoped>
.paint-canvas {
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
