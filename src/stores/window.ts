import { defineStore } from 'pinia';
import { ref } from 'vue';

type WindowReference = {
  [applicationName: string]: { id: number; zIndex: number; minimized: boolean }[];
};

export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReference>({});

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
    console.log(openWindowsReferences.value);
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

  return {
    openWindowsReferences,
    pushOpenWindowReference,
    removeOpenWindowReference,
    setWindowMinimized,
  };
});
