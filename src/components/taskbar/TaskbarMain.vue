<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/taskbar/TaskbarTile.vue';
import TimeProcessSection from '@/components/TimeProcessSection.vue';
import { ref, type StyleValue, watch } from 'vue';
import type { TaskbarTileItem } from '@/types/taskbarTypes.ts';
import { useWatchTaskbarProperties } from '@/composables/taskbar/useWatchTaskbarProperties.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileStore } from '@/stores/file.ts';

const taskbarStore = useTaskbarStore();
const taskbarItems = ref<TaskbarTileItem[]>();
useWatchTaskbarProperties(taskbarItems);

function getTaskbarAlignmentClass() {
  switch (taskbarStore.taskbarPosition) {
    default:
    case 'center':
      return 'center';
    case 'left':
      return 'left';
  }
}

const windowStore = useWindowStore();
watch(
  () => windowStore.openWindowsReferences,
  (windowsReferences) => {
    if (!taskbarItems.value) {
      taskbarItems.value = [];
    }

    const windowsReferencesLabels = Object.keys(windowsReferences);

    for (const taskbarItem of taskbarItems.value) {
      if (!taskbarItem.temp) continue;

      const windowReferences = windowsReferences[taskbarItem.label];
      if (windowReferences !== undefined && windowReferences.length !== 0) continue;

      taskbarItems.value = taskbarItems.value?.filter((item) => item.id !== taskbarItem.id);
    }


    for (const label of windowsReferencesLabels) {
      if (!taskbarItems.value.some((item) => item.label === label)) {
        const windowReference = windowsReferences[label];
        if (windowReference.length === 0) continue;

        const application = useFileStore().applications.find(
          (application) => application.label === label,
        );

        if (!application) return;

        taskbarItems.value.push({
          content: application.content,
          id: application.id,
          label: application.label,
          tileId: taskbarItems.value.length,
          temp: true,
        });
      }
    }
  },
  { deep: true },
);

const taskbarStyle: StyleValue = { height: `${taskbarStore.taskbarHeight}px` };
</script>
<template>
  <div :class="getTaskbarAlignmentClass()" :style="taskbarStyle" class="taskbar">
    <div class="taskbar-tiles-wrapper">
      <div class="taskbar-tiles">
        <TaskbarTile
          v-for="item of taskbarItems"
          :key="item.tileId"
          :taskbar-items="taskbarItems ?? []"
          :application-id="item.id"
        />
      </div>
    </div>
    <div class="clock-wrapper">
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

.clock-wrapper {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding-inline: 25px;
  right: 0;
}

@media (max-width: 510px) {
  .clock-wrapper {
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
