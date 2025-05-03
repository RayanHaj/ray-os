import { defineStore } from 'pinia'
import { reactive } from 'vue'

type WindowReference = {
  [key: string]: { id: number, zIndex: number }[];
}

export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = reactive<WindowReference>({});

  function pushOpenWindowReference(windowName: string) {
    let id = 1000;

    if (typeof openWindowsReferences[windowName] === 'undefined') {
      openWindowsReferences[windowName] = [{ id: id, zIndex: generateNextZIndex() }];
      return;
    }

    id = openWindowsReferences[windowName].reduce((accumulator, value) => {
      if (value.id > accumulator) {
        accumulator = value.id;
      }

      return accumulator;
    }, id);
    id += 1;

    openWindowsReferences[windowName].push({id: id, zIndex: generateNextZIndex()});
  }

  function generateNextZIndex() {
    const keys = Object.keys(openWindowsReferences);
    return keys.reduce((accumulator, value) => {
      openWindowsReferences[value].forEach(element => {
        if (element.zIndex > accumulator) {
          accumulator = element.zIndex;
        }
      });

      return accumulator;
    }, 1) + 1;
  }

  function removeOpenWindowReference(windowName: string, reference: number) {
    if (typeof openWindowsReferences[windowName] === 'undefined') {
      return;
    }

    openWindowsReferences[windowName] =
      openWindowsReferences[windowName]
        .filter(windowReference => windowReference.id !== reference);

    if (openWindowsReferences[windowName].length === 0) {
      delete openWindowsReferences[windowName];
    }
  }

  return { openWindowsReferences, pushOpenWindowReference, removeOpenWindowReference }
})
