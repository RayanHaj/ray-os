<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/taskbar/TaskbarTile.vue';
import StartMenuMain from '@/components/startMenu/StartMenuMain.vue';
import { useStartMenuStore } from '@/stores/startMenu.ts';
import TimeProcessSection from '@/components/TimeProcessSection.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useFileStore } from '@/stores/file.ts';

const taskbarStore = useTaskbarStore();
const fileStore = useFileStore();

const taskbarHeight = taskbarStore.taskbarHeight;
const taskbarItems = fileStore.applications;

const startMenuStore = useStartMenuStore();
</script>
<template>
  <StartMenuMain v-if="startMenuStore.isShown()" />
  <div class="taskbar" :style="{ height: `${taskbarHeight}px` }">
    <div class="left-section">
      <button
        class="taskbar-search-button"
        @click="startMenuStore.isShown() ? startMenuStore.hide() : startMenuStore.show()"
        :style="{ backgroundColor: startMenuStore.isShown() ? 'var(--button-hover-color)' : '' }"
      >
        <component class="search-svg" :is="useSvgOrFallback('Search').svg" />
      </button>
    </div>
    <div class="middle-section">
      <div class="taskbar-tiles">
        <TaskbarTile v-for="item of taskbarItems" :key="item.id" :id="item.id" />
      </div>
    </div>
    <div class="right-section">
      <TimeProcessSection />
    </div>
  </div>
</template>
<style scoped>
.taskbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 100%;
  position: sticky;
  z-index: 9999;
  background-color: var(--taskbar-background-color);
  color: var(--text-color);
  padding-left: 25px;
  padding-right: 25px;
}

.middle-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  gap: 15px;
  width: 60%;
}

.taskbar-tiles {
  display: flex;
}

.taskbar-search-button {
  background: none;
  border: none;
  border-radius: 10px;
}

.taskbar-search-button:hover {
  background: var(--button-hover-color);
}

.left-section,
.right-section {
  width: 20%;
}

.right-section {
  display: flex;
  flex-direction: row;
  justify-content: end;
}

.search-svg {
  width: 55px;
  height: 55px;
}

@media (max-width: 1120px) {
  .left-section {
    display: none;
  }
  .middle-section {
    display: flex;
    justify-content: start;
    width: 80%;
  }
  .taskbar-tiles {
    align-items: start;
  }
  .search-svg {
    width: 40px;
    height: 40px;
  }

  .time-process-wrapper {
    font-size: var(--font-size-md);
  }
}

@media (max-width: 690px) {
  .right-section {
    display: none;
  }
  .middle-section {
    justify-content: center;
    width: 100%;
  }
}
</style>
