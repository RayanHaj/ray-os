import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTaskbarStore = defineStore('taskbar', () => {
  const taskbarHeight = ref(90);
  return { taskbarHeight };
});
