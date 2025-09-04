import { defineStore } from 'pinia';
import { ref } from 'vue';

type CurrentSnapLayoutSession = {
  windowId: string;
  showSnapLayout: 'beam' | 'full' | '';
  selectedLayout: string;
};

export const useSnapLayoutStore = defineStore('snapLayout', () => {
  const defaultSessionValue: CurrentSnapLayoutSession = {
    windowId: '',
    showSnapLayout: '',
    selectedLayout: '',
  };

  const currentSnapLayoutSession = ref<CurrentSnapLayoutSession>(defaultSessionValue);

  function openSnapLayout(windowId: string, showSnapLayout: 'beam' | 'full') {
    currentSnapLayoutSession.value = {
      windowId: windowId,
      showSnapLayout: showSnapLayout,
      selectedLayout: ''
    }
  }

  function closeSnapLayout() {
    currentSnapLayoutSession.value = {
      windowId: currentSnapLayoutSession.value.windowId,
      showSnapLayout: '',
      selectedLayout: ''
    }
  }

  return { currentSnapLayoutSession, openSnapLayout, closeSnapLayout };
});
