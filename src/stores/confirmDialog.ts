import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfirmDialogStore = defineStore('confirmDialog', () => {
  const WIDTH = 400;
  const HEIGHT = 300;

  const confirmDialogs = ref<Record<string, boolean | undefined>>({});

  function addConfirmDialog(confirmDialogWindowId: string) {
    confirmDialogs.value[confirmDialogWindowId] = undefined;
  }

  function removeConfirmDialog(confirmDialogWindowId: string) {
    delete confirmDialogs.value[confirmDialogWindowId];
  }
  return { confirmDialogs, WIDTH, HEIGHT, addConfirmDialog, removeConfirmDialog };
});
