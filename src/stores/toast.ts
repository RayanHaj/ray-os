import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TimeoutId, Toast, ToastTypes } from '@/types/ToastTypes.ts';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  const timeoutIds = ref<TimeoutId[]>([]);

  function createToast(message: string, type: ToastTypes, milliseconds: number): number {
    toasts.value = [...toasts.value, { message: message, type: type, milliseconds: milliseconds }];
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

  return { toasts, createToast, closeToast };
});
