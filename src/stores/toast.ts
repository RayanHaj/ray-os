import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TimeoutId, Toast, ToastTypes } from '@/types/ToastTypes.ts';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  const timeoutIds = ref<TimeoutId[]>([]);

  function createToast(message: string, type: ToastTypes, milliseconds: number, location: 'window' | 'desktop', windowId?: string): number {
    const toast: Toast = { message: message, type: type, milliseconds: milliseconds, location: location};
    if (windowId) {
      toast.windowId = windowId;
    }

    toasts.value = [...toasts.value, toast];
    const position = toasts.value.length - 1;
    const timeoutId = setTimeout(() => {
      closeToast(position! < 0 ? position : 0);
    }, milliseconds);

    timeoutIds.value.push({ toastIndex: position, id: timeoutId });
    return position;
  }

  function closeToast(position: number) {
    const currentTimeoutId = timeoutIds.value.find(
      (timeoutId) => timeoutId.toastIndex === position,
    );
    if (currentTimeoutId) {
      timeoutIds.value = timeoutIds.value.filter((timeoutId) => timeoutId !== currentTimeoutId);
      clearTimeout(currentTimeoutId.id);
    }

    toasts.value = toasts.value.filter((_, index) => index !== position);
  }

  //TODO: MAKE THIS FUNCTION SO IT CAN TARGET A SPECIFIC TOAST LOCATION
  function clearToasts() {
    for (const timeoutId of timeoutIds.value) {
      clearTimeout(timeoutId.id);
    }

    timeoutIds.value = [];
  }

  return { toasts, createToast, closeToast };
});
