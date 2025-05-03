<script setup lang="ts">
  import { useTaskbarStore } from '@/stores/taskbar.ts';


  const flying = false;
  const taskbarHeight = useTaskbarStore().taskbarHeight;
</script>

<template>
  <div class="taskbar" :class="{'active': !flying}" :style="{height: `${taskbarHeight}px`}">
    <div class="flying" :class="{'active': flying}">
      <div :style="{marginLeft: '20px'}"></div>
      <div>

      </div>
      <div :style="{marginRight: '20px'}"></div>
    </div>
  </div>
</template>

<style scoped>
.taskbar {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 100%;
  position: sticky;
  z-index: 9999;
}

.flying {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 80%;
  border-radius: 10px;
}

.active {
  background-color: var(--taskbar-background-color);
  color: white;
}
</style>
