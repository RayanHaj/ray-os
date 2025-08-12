import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import type { WindowFlatReference, WindowReference } from '@/types/WindowTypes.ts';
import type { Application } from '@/types/ItemTypes.ts';

type WindowReferences = { [applicationName: string]: WindowReference[] };
export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReferences>({});
  const zIndexesOrder = ref<string[]>([]);
  const windowHeaderHeight = readonly(ref(30));

  function pushOpenWindowReference(windowName: string | Application) {
    const id = getNextWindowId(windowName);
    const idNumber = Number(id.split('-')[1]);
    console.log(idNumber)

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [{ id: idNumber, minimized: false }];
      return id;
    }

    openWindowsReferences.value[windowName].push({ id: idNumber, minimized: false });
    pushWindowToFront(windowName, idNumber);
    return id;
  }

  function getNextWindowId(windowName: string | Application) {
    const minId = 1000;

    const windowReferences = openWindowsReferences.value[windowName];
    if (!windowReferences) {
      return getWindowId(windowName, minId);
    }

    const id = openWindowsReferences.value[windowName].reduce((accumulator, value) => {
      if (value.id > accumulator) {
        accumulator = value.id;
      }

      return accumulator;
    }, minId);

    return getWindowId(windowName, id + 1);
  }

  function getWindowId(windowName: string, id: number) {
    return `${windowName}-${id}`;
  }

  function pushWindowToFront(windowName: string, id: number) {
    zIndexesOrder.value.push(getWindowId(windowName, id));
  }

  function getWindowCountByName(windowName: string) {
    const reference = openWindowsReferences.value[windowName];
    if (!reference) {
      return 0;
    }

    return reference.length;
  }

  function setWindowMinimized(windowId: string) {
    const windowIdSplit = windowId.split('-');
    const windowName = windowIdSplit[0];
    const id = Number(windowIdSplit[1]);

    const index = openWindowsReferences.value[windowName].findIndex(
      (reference) => reference.id === id
    );

    if (index === -1) {
      return;
    }

    openWindowsReferences.value[windowName][index].minimized =
      !openWindowsReferences.value[windowName][index].minimized;
  }

  function removeOpenWindowReference(windowId: string) {
    const windowIdSplit = windowId.split('-');
    const windowName = windowIdSplit[0];
    const id = Number(windowIdSplit[1]);

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      return;
    }

    openWindowsReferences.value[windowName] = openWindowsReferences.value[windowName].filter(
      (windowReference) => windowReference.id !== id
    );

    if (openWindowsReferences.value[windowName].length === 0) {
      delete openWindowsReferences.value[windowName];
    }

    if (zIndexesOrder.value.includes(windowId)) {
      zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== windowId);
    }
  }

  function setWindowZIndexToTop(reference: WindowFlatReference) {
    const globalId = getWindowId(reference.label, reference.id);
    zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== globalId);
    zIndexesOrder.value.push(globalId);
  }

  function getZIndex(windowName: string, id: number) {
    const globalId = getWindowId(windowName, id);
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
    getNextWindowId,
    getGlobalId: getWindowId,
    getZIndex
  };
});
