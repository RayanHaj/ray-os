import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStartMenuStore = defineStore('startMenu', () => {
  const showStartMenu = ref(false);

  function show() {
    showStartMenu.value = true;
  }

  function hide() {
    showStartMenu.value = false;
  }

  function isShown() {
    return showStartMenu.value;
  }

  return { isShown, show, hide };
});
