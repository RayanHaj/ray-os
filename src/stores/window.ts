import { defineStore } from 'pinia'
import { ref } from 'vue'

type WindowReference = {
  [key: string]: number[];
}

export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReference>({});

  function pushOpenWindowReference(windowName: string) {
    let reference = 1000;
    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [reference];
      return;
    }

    reference = openWindowsReferences.value[windowName].reduce((accumulator, value) => {
      if (value > accumulator) {
        accumulator = value;
      }

      return accumulator;
    }, reference);

    reference += 1;

    openWindowsReferences.value[windowName].push(reference);
  }

  function removeOpenWindowReference(windowName: string, reference: number) {
    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      return;
    }

    openWindowsReferences.value[windowName] =
      openWindowsReferences.value[windowName]
        .filter(windowReference => windowReference !== reference);

    if (openWindowsReferences.value[windowName].length === 0) {
      delete openWindowsReferences.value[windowName];
    }
  }

  function getOpenWindowReferences() {
    return openWindowsReferences.value;
  }

  return { openWindowsReferences, pushOpenWindow: pushOpenWindowReference, getOpenWindowReferences, removeOpenWindowReference }
})
