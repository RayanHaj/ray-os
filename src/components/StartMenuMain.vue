<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';

const taskbarStore = useTaskbarStore();
</script>

<template>
  <div class="start-menu-wrapper" :style="{
    bottom: `${taskbarStore.taskbarHeight}px`,
    height: `calc(100% - ${taskbarStore.taskbarHeight}px)`
  }">
    <div class="start-menu">
      <div class="start-menu-header">
        <input type="text" placeholder="search">
      </div>
      <div class="start-menu-footer">

      </div>
    </div>
  </div>
</template>

<style scoped>
.start-menu-wrapper {
  position: absolute;
  width: 400px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-menu {
  position: relative;
  width: 350px;
  height: 95%;
  background-color: rgba(0, 0, 0, 0.7);
  border: var(--accent-color) solid 2px;
  border-radius: 15px;
}

.start-menu-header, .start-menu-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin: auto;
  left: 50%;
  transform: translateX(-50%);
  height: 70px;
  width: 97%;
}

.start-menu-footer {
  bottom: 5px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background: var(--accent-color);
}

.start-menu-header {
  top: 5px;
}

.start-menu-header input {
  width: 98%;
  height: 90%;
  border-radius: 12px;
  background: var(--input-primary-color);
  color: var(--text-color);
  border: var(--input-border-color) 1px solid;
  font-size: 19px;
  padding-left: 10px;
}
</style>
