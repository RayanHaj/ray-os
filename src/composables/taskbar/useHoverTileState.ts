import { readonly, ref } from 'vue';

export function useHoverTileState() {
  const setTimeoutId = ref<number | null>(null);
  const hoverState = ref(false);

  function setHoverState(useTimeout: boolean) {
    if (useTimeout) {
      setTimeoutId.value = setTimeout(() => {
        hoverState.value = true;
      }, 500);
    } else {
      hoverState.value = true;
    }
  }

  function clearHoverState(useTimeout = false, clearTimeout = true, callbackFunc?: () => void) {
    if (useTimeout) {
      setTimeoutId.value = setTimeout(() => {
        hoverState.value = false;
        if (callbackFunc) callbackFunc();
        if (clearTimeout) clearHoverStateTimeout();
      }, 500);
    } else {
      hoverState.value = false;
      if (callbackFunc) callbackFunc();
      if (clearTimeout) clearHoverStateTimeout();
    }
  }

  function clearHoverStateTimeout() {
    if (!setTimeoutId.value) return;

    clearTimeout(setTimeoutId.value);
    setTimeoutId.value = null;
  }

  return {
    hoverState: readonly(hoverState),
    setHoverState,
    clearHoverState,
    clearHoverStateTimeout,
  };
}
