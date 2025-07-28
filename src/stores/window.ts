import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import type { WindowFlatReference, WindowReference } from '@/types/WindowTypes.ts';

type WindowReferences = { [applicationName: string]: WindowReference[] };

export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReferences>({});
  const zIndexesOrder = ref<string[]>([]);
  const windowHeaderHeight = readonly(ref(30));

  function pushOpenWindowReference(windowName: string) {
    let id = 1000;

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [{ id: id, minimized: false }];
      return;
    }

    id = openWindowsReferences.value[windowName].reduce((accumulator, value) => {
      if (value.id > accumulator) {
        accumulator = value.id;
      }

      return accumulator;
    }, id);
    id += 1;

    openWindowsReferences.value[windowName].push({ id: id, minimized: false });
    pushWindowToFront(windowName, id);
  }

  function getGlobalId(windowName: string, id: number) {
    return `${windowName}-${id}`;
  }

  function pushWindowToFront(windowName: string, id: number) {
    zIndexesOrder.value.push(getGlobalId(windowName, id));
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

    const globalId = getGlobalId(windowName, reference);
    if (zIndexesOrder.value.includes(globalId)) {
      zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== globalId);
    }
  }

  function setWindowZIndexToTop(reference: WindowFlatReference) {
    const globalId = getGlobalId(reference.label, reference.id);
    zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== globalId);
    zIndexesOrder.value.push(globalId);
  }

  function getZIndex(windowName: string, id: number) {
    const globalId = getGlobalId(windowName, id);
    if (!zIndexesOrder.value.includes(globalId)) {
      pushWindowToFront(windowName, id);
    }

    const minZIndex = 10;
    return zIndexesOrder.value.indexOf(globalId) + minZIndex;
  }

  return {
    openWindowsReferences,
    zIndexesOrder,
    windowHeaderHeight,
    pushOpenWindowReference,
    removeOpenWindowReference,
    setWindowMinimized,
    setWindowZIndexToTop,
    getWindowCountByName,
    getGlobalId,
    getZIndex,
  };
});
