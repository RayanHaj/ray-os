<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { type TaskbarPosition, useTaskbarStore } from '@/stores/taskbar.ts';
import { useResetState } from '@/composables/useResetState.ts';
import { ref, watch } from 'vue';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const { windowId } = defineProps<{ windowId: string }>();

const taskbarStore = useTaskbarStore();
const taskbarPosition = ref<TaskbarPosition>();
watch(
  () => taskbarStore.taskbarPosition,
  (newPosition) => (taskbarPosition.value = newPosition),
  { immediate: true },
);
</script>

<template>
  <div class="settings-system">
    <div class="taskbar-tiles-position">
      <p>Taskbar tiles position:</p>
      <div class="radio-group">
        <label for="leftTiles" @click="useTaskbarStore().setTaskbarPosition('left')"
          ><input
            id="leftTiles"
            type="radio"
            :checked="useTaskbarStore().taskbarPosition === 'left'"
          />
          left</label
        >
        <label for="centerTiles" @click="useTaskbarStore().setTaskbarPosition('center')"
          ><input
            id="centerTiles"
            type="radio"
            :checked="useTaskbarStore().taskbarPosition === 'center'"
          />
          center</label
        >
      </div>
    </div>
    <hr />
    <div class="reset-state-wrapper">
      <p>Warning: close all other RayOS tabs before resetting</p>
      <button class="reset-state-button" @click="useResetState(rayDb, windowId)">
        Reset everything
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-system {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}
.taskbar-tiles-position {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.radio-group {
  display: flex;
  gap: 50px;
}
.reset-state-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.reset-state-button {
  width: 100%;
  background: red;
  color: white;
  padding: 10px;
  border: none;
}

p {
  font-weight: bold;
}

hr {
  width: 100%;
  border: var(--window-border-color) solid 2px;
  border-radius: 5px;
}
</style>
