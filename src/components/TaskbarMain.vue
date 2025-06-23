<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import TaskbarTile from '@/components/TaskbarTile.vue';
import { type Component, onBeforeMount, shallowRef } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import StartMenuMain from '@/components/StartMenuMain.vue';
import { useStartMenuStore } from '@/stores/startMenu.ts';
import TimeProcessSection from '@/components/TimeProcessSection.vue';

const taskbarStore = useTaskbarStore();
const taskbarHeight = taskbarStore.taskbarHeight;

const searchSvg = shallowRef<Component | undefined>();
onBeforeMount(async () => {
  searchSvg.value = (await useSvgByFileNameAndDirectory('ui', 'Search')) ?? undefined;
});

const startMenuStore = useStartMenuStore();
</script>
<template>
  <StartMenuMain v-show="startMenuStore.isShown()" />
  <div class="taskbar" :style="{ height: `${taskbarHeight}px` }">
    <div class="left-side">
      <button
        type="button"
        class="taskbar-search-button"
        @click="startMenuStore.show()"
        :style="{ backgroundColor: startMenuStore.isShown() ? 'var(--button-hover-color)' : '' }"
      >
        <component :is="searchSvg" :custom-width="55" :custom-height="55" />
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
    <div class="right-side">
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

.tiles {
  display: flex;
}

.taskbar-search-button {
  background: none;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.taskbar-search-button:hover {
  background: var(--button-hover-color);
}

.left-side,
.right-side {
  width: 20%;
}

.right-side {
  display: flex;
  flex-direction: row;
  justify-content: end;
}
</style>
