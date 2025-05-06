<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/TaskbarTile.vue';
import { useDateTime } from '../composables/UseDateTime.ts';
import { type Component, onBeforeMount, ref } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

const taskbarStore = useTaskbarStore();
const taskbarHeight = taskbarStore.taskbarHeight;
const { time } = useDateTime();

const searchSvg = ref<Component | undefined>();
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
    <div class="tiles">
      <TaskbarTile
        v-for="item of taskbarStore.items"
        :key="item.content.id"
        :id="item.content.id"
      />
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

.tiles {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.search-button {
  background: var(--button-primary-color);
  border: none;
  padding: 7px 10px;
  border-radius: 5px;
}

.search-button:hover {
  background: var(--button-secondary-color);
}
</style>
