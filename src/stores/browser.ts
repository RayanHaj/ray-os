import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useTaskbarStore } from '@/stores/taskbar.ts';

export const useBrowserStore = defineStore('browser', () => {
  const width = ref(0);
  const height = ref(0);
  const heightExcTaskbar = ref(0);

  const currentTheme = ref('');

  const taskbarStore = useTaskbarStore();

  const isMobile = ref(window.matchMedia('(any-pointer: coarse)').matches);

  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    heightExcTaskbar.value = height.value - taskbarStore.taskbarHeight;
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      isMobile.value = true;
    } else if (e.pointerType === 'mouse') {
      isMobile.value = false;
    }
  };

  function startListening() {
    updateSizes();
    addEventListener('resize', updateSizes);
    addEventListener('pointerdown', onPointerDown);
  }

  function stopListening() {
    removeEventListener('resize', updateSizes);
    removeEventListener('pointerdown', onPointerDown);
  }

  return { width, height, heightExcTaskbar, startListening, stopListening, currentTheme, isMobile };
});
