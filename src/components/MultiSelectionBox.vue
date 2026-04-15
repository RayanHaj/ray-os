<script setup lang="ts">
defineProps<{ isSelecting: boolean; width: number; height: number; left: number; top: number }>();
// const isSelecting = ref<boolean>(false);
// const startX = ref<number>(0);
// const startY = ref<number>(0);
// const styles: Ref<{ width: number; height: number; left: number; top: number }> = ref({
//   width: 0,
//   height: 0,
//   left: 0,
//   top: 0,
// });

// function onMouseDown(e: MouseEvent) {
//   startX.value = e.clientX;
//   startY.value = e.clientY;
//
//   styles.value.left = e.clientX;
//   styles.value.top = e.clientY;
//
//   addEventListener('mousemove', onMouseMove);
// }
//
// function onMouseMove(e: MouseEvent) {
//   isSelecting.value = true;
//   styles.value.width = e.clientX - startX.value;
//   styles.value.height = e.clientY - startY.value;
// }
//
// function onMouseUp(e: MouseEvent) {
//   removeEventListener('mousemove', onMouseMove);
//
//   isSelecting.value = false;
//   styles.value = { width: 0, height: 0, left: 0, top: 0 };
// }
</script>
<template>
  <div
    class="multi-selection-box"
    v-show="isSelecting"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
    }"
  />
</template>
<style scoped>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.multi-selection-box {
  position: absolute;
  background-color: rgba(68, 170, 255, 0.15);
  border: 1px solid #4af;
  pointer-events: none;
}
</style>
