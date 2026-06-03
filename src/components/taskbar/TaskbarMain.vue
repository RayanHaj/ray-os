<script setup lang="ts">
import { type TaskbarPosition, useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/taskbar/TaskbarTile.vue';
import TimeProcessSection from '@/components/TimeProcessSection.vue';
import { useFileStore } from '@/stores/file.ts';
import { watch } from 'vue';

const taskbarStore = useTaskbarStore();
const fileStore = useFileStore();

const taskbarHeight = taskbarStore.taskbarHeight;
const taskbarItems = fileStore.applications;

watch(
  () => taskbarStore.taskbarPosition,
  (newPosition) => {
    const lsTaskbarPosition = localStorage.getItem('taskbarPosition');
    if (lsTaskbarPosition !== newPosition) {
      useTaskbarStore().setTaskbarPosition(lsTaskbarPosition as TaskbarPosition);
    }
  },
  { immediate: true },
);
</script>
<template>
  <div
    :class="{
      left: taskbarStore.taskbarPosition === 'left',
      center: taskbarStore.taskbarPosition === 'center',
    }"
    :style="{ height: `${taskbarHeight}px` }"
    class="taskbar"
  >
    <div class="taskbar-tiles-wrapper">
      <div class="taskbar-tiles">
        <TaskbarTile v-for="item of taskbarItems" :key="item.id" :id="item.id" />
      </div>
    </div>
    <div class="end-alignment">
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
  padding-inline: 25px;
}

.taskbar-tiles-wrapper {
  display: flex;
  align-content: center;
  flex-direction: row;
  width: 100%;
}

.taskbar.left {
  .taskbar-tiles-wrapper {
    justify-content: start;
  }
}

.taskbar.center {
  .taskbar-tiles-wrapper {
    justify-content: center;
  }
}

.taskbar-tiles {
  display: flex;
  flex-direction: row;
}

.end-alignment {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding-inline: 25px;
  right: 0;
}

@media (max-width: 510px) {
  .end-alignment {
    display: none;
  }
  .taskbar-tiles-wrapper {
    justify-content: center;
  }
  .taskbar.left {
    .taskbar-tiles-wrapper {
      justify-content: center;
    }
  }
}
</style>
