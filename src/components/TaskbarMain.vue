<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/TaskbarTile.vue';
import { useDateTime } from '../composables/UseDateTime.ts';
import { type Component, onBeforeMount, shallowRef } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

const taskbarStore = useTaskbarStore();
const taskbarHeight = taskbarStore.taskbarHeight;
const { time } = useDateTime();

const searchSvg = shallowRef<Component | undefined>();
onBeforeMount(async () => {
  searchSvg.value = (await useSvgByFileNameAndDirectory('ui', 'Search')) ?? undefined;
});
</script>

<template>
  <div class="taskbar" :style="{ height: `${taskbarHeight}px` }">
    <div class="right-side">
      <button class="search-button">
        <component :is="searchSvg" :custom-width="40" :custom-height="40" />
      </button>
    </div>
    <div class="middle">
      <div class="tiles">
        <TaskbarTile
          v-for="item of taskbarStore.items"
          :key="item.content.id"
          :id="item.content.id"
        />
      </div>
    </div>
    <div class="left-side">
      {{ time }}
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

.tiles {
  display: flex;
}

.search-button {
  background: none;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.search-button:hover {
  background: var(--button-hover-color);
}

.left-side,
.right-side {
  width: 20%;
}

.left-side {
  font-size: 20px;
  font-family: 'Courier New', sans-serif;
  text-align: end;
}
</style>
