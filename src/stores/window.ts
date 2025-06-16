import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WindowReference } from '@/types/WindowReference.ts';
import type { WindowFlatReference } from '@/types/WindowFlatReference.ts';

type WindowReferences = {
  [applicationName: string]: WindowReference[];
};

export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReferences>({});

  function pushOpenWindowReference(windowName: string) {
    let id = 1000;

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [
        { id: id, zIndex: generateNextZIndex(), minimized: false },
      ];
      return;
    }

    id = openWindowsReferences.value[windowName].reduce((accumulator, value) => {
      if (value.id > accumulator) {
        accumulator = value.id;
      }

      return accumulator;
    }, id);
    id += 1;

    openWindowsReferences.value[windowName].push({
      id: id,
      zIndex: generateNextZIndex(),
      minimized: false,
    });
  }

  function getWindowCountByName(windowName: string) {
    const reference = openWindowsReferences.value[windowName];
    if (!reference) {
      return 0;
    }

    return reference.length;
  }

  function setWindowMinimized(windowName: string, id: number) {
    const index = openWindowsReferences.value[windowName].findIndex(
      (reference) => reference.id === id,
    );

    if (index === -1) {
      return;
    }

    openWindowsReferences.value[windowName][index].minimized =
      !openWindowsReferences.value[windowName][index].minimized;
  }

  function generateNextZIndex() {
    const keys = Object.keys(openWindowsReferences.value);
    return (
      keys.reduce((accumulator, value) => {
        openWindowsReferences.value[value].forEach((element) => {
          if (element.zIndex > accumulator) {
            accumulator = element.zIndex;
          }
        });

        return accumulator;
      }, 1) + 1
    );
  }

  function removeOpenWindowReference(windowName: string, reference: number) {
    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      return;
    }

    openWindowsReferences.value[windowName] = openWindowsReferences.value[windowName].filter(
      (windowReference) => windowReference.id !== reference,
    );

    if (openWindowsReferences.value[windowName].length === 0) {
      delete openWindowsReferences.value[windowName];
    }
  }

  function setWindowZIndexToTop(reference: WindowFlatReference) {
    const index = openWindowsReferences.value[reference.label].findIndex(
      (value) => reference.id === value.id,
    );
    if (index !== -1) {
      const value = openWindowsReferences.value[reference.label][index];
      value.zIndex = generateNextZIndex();

      openWindowsReferences.value[reference.label][index] = value;
    }
  }

  return {
    openWindowsReferences,
    pushOpenWindowReference,
    removeOpenWindowReference,
    setWindowMinimized,
    setWindowZIndexToTop,
    getWindowCountByName
  };
});
