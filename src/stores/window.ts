import { defineStore } from 'pinia';
import { readonly, type Ref, ref, watch } from 'vue';

import type { WindowControl, WindowControlSignal, WindowReference } from '@/types/windowTypes.ts';
import type { Application } from '@/types/itemTypes.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useToastStore } from '@/stores/toast.ts';

type WindowReferences = { [applicationName: string]: WindowReference[] };
export const useWindowStore = defineStore('window', () => {
  const openWindowsReferences = ref<WindowReferences>({});
  const zIndexesOrder = ref<string[]>([]);
  const windowHeaderHeight = readonly(ref(30));

  function pushOpenWindowReference(windowName: string | Application, left?: string, top?: string) {
    const id = getNextWindowId(windowName);
    const idNumber = Number(id.split('-')[1]);

    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      openWindowsReferences.value[windowName] = [{ id: idNumber, minimized: false, left, top }];
      return id;
    }

    openWindowsReferences.value[windowName].push({ id: idNumber, minimized: false, left, top });
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

  /**
   * Builds a windowId string from a windowName and id
   * @param windowName
   * @param id
   */
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

  function removeOpenWindowReference(windowId: string, fileSelectWindowId?: string) {
    const { windowName, id } = splitWindowId(windowId);
    if (typeof openWindowsReferences.value[windowName] === 'undefined') {
      return;
    }

    useFileExplorerStore().fileSelectState = useFileExplorerStore().fileSelectState.filter(
      (element) => element.fileExplorerWindowId !== windowId,
    );

    useFileExplorerStore().fileSelectReturnValue =
      useFileExplorerStore().fileSelectReturnValue.filter(
        (element) => element.windowId !== fileSelectWindowId,
      );

    openWindowsReferences.value[windowName] = openWindowsReferences.value[windowName].filter(
      (windowReference) => windowReference.id !== id,
    );

    if (openWindowsReferences.value[windowName].length === 0)
      delete openWindowsReferences.value[windowName];

    if (zIndexesOrder.value.includes(windowId))
      zIndexesOrder.value = zIndexesOrder.value.filter((value) => value !== windowId);

    useToastStore().closeToastsByWindowId(windowId);
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

  const _windowControlClickSignal: Ref<WindowControlSignal | undefined> = ref(undefined);
  function updateWindowControlClickSignal(windowControlSignal: WindowControlSignal) {
    _windowControlClickSignal.value = windowControlSignal;
  }

  function watchWindowControlClickSignal(func: (control: WindowControl) => void, windowId: string) {
    watch(_windowControlClickSignal, (newValue) => {
      if (newValue?.windowId !== windowId) return;
      func(newValue.windowControl);
    });
  }

  //TODO Finish window control signals so a window control can be intercepted when it should not proceed with the action
  const windowControlClickSignal = (
    callback: (
      windowControlSignal: WindowControlSignal,
    ) => void | Promise<void> | boolean | Promise<boolean>,
    options?: { proceedOnCallbackReturnBool?: boolean },
  ) =>
    watch(_windowControlClickSignal, async (newValue, oldValue) => {
      if (!newValue || newValue === oldValue) return;

      await callback(newValue);

      // const proceed = await callback(newValue);
      // if (typeof proceed === 'boolean' && options?.proceedOnCallbackReturnBool) {
      //
      // }

      _windowControlClickSignal.value = undefined;
    });

  return {
    windowControlClickSignal,
    updateWindowControlClickSignal,
    watchWindowControlClickSignal,
    openWindowsReferences,
    zIndexesOrder,
    windowHeaderHeight,
    pushOpenWindowReference,
    removeOpenWindowReference,
    setWindowMinimized,
    setWindowZIndexToTop,
    getWindowCountByName,
    getNextWindowId,
    getWindowId,
    getZIndex,
    getFocusedWindowId,
  };
});
