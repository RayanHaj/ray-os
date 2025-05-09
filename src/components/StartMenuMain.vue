<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';

const taskbarStore = useTaskbarStore();
</script>

<template>
  <div class="start-menu" :style="{ bottom: `${taskbarStore.taskbarHeight}px` }"></div>
</template>

<style scoped>
.start-menu {
  position: absolute;
  background-color: red;
  width: 250px;
  height: 50%;
  left: 0;
  border: white solid 5px;
}
</style>
