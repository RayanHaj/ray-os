import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfirmDialogStore = defineStore('confirmDialog', () => {
  const WIDTH = 400;
  const HEIGHT = 300;

  const confirmDialogs = ref<Record<string, { message: string, confirmed: boolean | undefined }>>({});

  function addConfirmDialog(message: string, confirmDialogWindowId: string) {
    confirmDialogs.value[confirmDialogWindowId] = {
      message,
      confirmed: undefined
    };
  }

  function removeConfirmDialog(confirmDialogWindowId: string) {
    delete confirmDialogs.value[confirmDialogWindowId];
  }
  return { confirmDialogs, WIDTH, HEIGHT, addConfirmDialog, removeConfirmDialog };
});
