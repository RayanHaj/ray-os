import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ItemType } from '@/types/ItemTypes.ts';

export const useStartMenuStore = defineStore('startMenu', () => {
  const showStartMenu = ref(false);
  const selectedTag = ref<ItemType>('application');

  function show() {
    showStartMenu.value = true;
  }

  function hide() {
    showStartMenu.value = false;
  }

  function isShown() {
    return showStartMenu.value;
  }

  return { isShown, show, hide, selectedTag };
});
