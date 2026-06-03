import { ref } from 'vue';
import { defineStore } from 'pinia';

export type TaskbarPosition = 'center' | 'left'
export const useTaskbarStore = defineStore('taskbar', () => {
  const taskbarHeight = ref(70);
  const taskbarPosition = ref<TaskbarPosition>('center');

  function setTaskbarPosition(position: TaskbarPosition) {
    localStorage.setItem('taskbarPosition', position);
    taskbarPosition.value = position;
  }

  return { taskbarHeight, taskbarPosition, setTaskbarPosition };
});
