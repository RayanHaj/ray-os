<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/taskbar/TaskbarTile.vue';
import StartMenuMain from '@/components/StartMenuMain.vue';
import { useStartMenuStore } from '@/stores/startMenu.ts';
import TimeProcessSection from '@/components/TimeProcessSection.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { type Component, onBeforeMount, shallowRef } from 'vue';

const taskbarStore = useTaskbarStore();
const taskbarHeight = taskbarStore.taskbarHeight;
const taskbarItems = taskbarStore.items;

const searchSvg = shallowRef<Component>();
onBeforeMount(() => {
  searchSvg.value = useSvgOrFallback('Search');
});

const startMenuStore = useStartMenuStore();
</script>
<template>
  <StartMenuMain v-show="startMenuStore.isShown()" />
  <div class="taskbar" :style="{ height: `${taskbarHeight}px` }">
    <div class="start">
      <button
        class="taskbar-search-button"
        @click="startMenuStore.show()"
        :style="{ backgroundColor: startMenuStore.isShown() ? 'var(--button-hover-color)' : '' }"
      >
        <component class="search-svg" :is="searchSvg" />
      </button>
    </div>
    <div class="middle">
      <div class="taskbar-tiles">
        <TaskbarTile v-for="item of taskbarItems" :key="item.content.id" :id="item.content.id" />
      </div>
    </div>
    <div class="end">
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

.middle {
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

.start,
.end {
  width: 20%;
}

.end {
  display: flex;
  flex-direction: row;
  justify-content: end;
}

.search-svg {
  width: 55px;
  height: 55px;
}

@media (max-width: 850px) {
  .start {
    display: none;
  }
  .middle {
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

@media (max-width: 550px) {
  .end {
    display: none;
  }
  .middle {
    justify-content: center;
    width: 100%;
  }
}
</style>
