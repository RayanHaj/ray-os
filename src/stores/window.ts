import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import type { WindowReference } from '@/types/WindowTypes.ts';
import type { Application } from '@/types/ItemTypes.ts';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import { useImageViewerStore } from '@/stores/imageViewer.ts';

type WindowReferences = { [applicationName: string]: WindowReference[] };
export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReferences>({});
  const zIndexesOrder = ref<string[]>([]);
  const windowHeaderHeight = readonly(ref(30));

  function pushOpenWindowReference(windowName: string | Application) {
    const id = getNextWindowId(windowName);
    const idNumber = Number(id.split('-')[1]);

    if (windowName === 'Video Player') {
      useVideoPlayerStore().hasOpenInstance = true;
    }

    if (windowName === 'Image Viewer') {
      useImageViewerStore().hasOpenInstance = false;
    }

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [{ id: idNumber, minimized: false }];
      return id;
    }

    openWindowsReferences.value[windowName].push({ id: idNumber, minimized: false });
    pushWindowToFront(getWindowId(windowName, idNumber));

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

  function pushWindowToFront(windowId: string) {
    zIndexesOrder.value.push(windowId);
  }

  function getWindowCountByName(windowName: string | Application) {
    const reference = openWindowsReferences.value[windowName];
    if (!reference) {
      return 0;
    }

    return reference.length;
  }

  function setWindowMinimized(windowId: string) {
    const { windowName, id } = splitWindowId(windowId);
    const index = openWindowsReferences.value[windowName].findIndex(
      (reference) => reference.id === id,
    );

    useWindowStore().setWindowZIndexToTop(windowId);

    if (index === -1) {
      return;
    }

    openWindowsReferences.value[windowName][index].minimized =
      !openWindowsReferences.value[windowName][index].minimized;
  }

  function removeOpenWindowReference(windowId: string) {
    const { windowName, id } = splitWindowId(windowId);
    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      return;
    }

    if (windowId === useVideoPlayerStore().loadedVideo.windowId) {
      const windowCount = getWindowCountByName('Video Player');
      if (windowCount > 1) {
        return;
      }

      useVideoPlayerStore().hasOpenInstance = false;
    }

    if (windowId === useImageViewerStore().loadedImage.windowId) {
      const windowCount = getWindowCountByName('Image Viewer');
      if (windowCount > 1) {
        return;
      }

      useImageViewerStore().hasOpenInstance = false;
    }

    openWindowsReferences.value[windowName] = openWindowsReferences.value[windowName].filter(
      (windowReference) => windowReference.id !== id,
    );

    if (openWindowsReferences.value[windowName].length === 0) {
      delete openWindowsReferences.value[windowName];
    }

    if (zIndexesOrder.value.includes(windowId)) {
      zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== windowId);
    }
  }

  function setWindowZIndexToTop(windowId: string) {
    zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== windowId);
    zIndexesOrder.value.push(windowId);
  }

  function getZIndex(windowId: string) {
    if (!zIndexesOrder.value.includes(windowId)) {
      pushWindowToFront(windowId);
    }

    const minZIndex = 10;
    return zIndexesOrder.value.indexOf(windowId) + minZIndex;
  }

  function splitWindowId(windowId: string) {
    const windowIdSplit = windowId.split('-');
    const windowName = windowIdSplit[0];
    const id = Number(windowIdSplit[1]);

    return { windowName, id };
  }

  function getFocusedWindowId(): string {
    return zIndexesOrder.value[zIndexesOrder.value.length - 1];
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
    getZIndex,
    getFocusedWindowId,
  };
});
