<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import StartMenuHeader from '@/components/startMenu/StartMenuHeader.vue';
import StartMenuContent from '@/components/startMenu/StartMenuContent.vue';
import { onUnmounted } from 'vue';
import { useStartMenuStore } from '@/stores/startMenu.ts';

const taskbarStore = useTaskbarStore();

onUnmounted(() => {
  useStartMenuStore().searchQuery = '';
});
</script>

<template>
  <div
    class="start-menu-wrapper"
    :style="{
      bottom: `${taskbarStore.taskbarHeight}px`,
      height: `calc(100% - ${taskbarStore.taskbarHeight}px)`,
    }"
  >
    <div class="start-menu">
      <StartMenuHeader/>
      <StartMenuContent/>
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
  z-index: 9999;
}

.start-menu {
  position: relative;
  width: 350px;
  height: 95%;
  background-color: var(--background-color);
  border: var(--accent-color) solid 2px;
  border-radius: 15px;
  padding: 10px;
}
</style>
