import { useWindowStore } from '@/stores/window.ts';
import { useConfirmDialogStore } from '@/stores/confirmDialog.ts';
import { watch } from 'vue';

export async function createConfirmDialog(message: string, left?: string, top?: string): Promise<boolean> {
  const windowStore = useWindowStore();
  const confirmDialogStore = useConfirmDialogStore();

  const confirmDialogWindowId = windowStore.pushOpenWindowReference('Confirm Dialog', left, top);
  confirmDialogStore.addConfirmDialog(message, confirmDialogWindowId);

  return new Promise<boolean>((resolve) => {
    const { stop } = watch(
      () => confirmDialogStore.confirmDialogs[confirmDialogWindowId],
      (result) => {
        if (typeof result.confirmed !== 'boolean') return;

        console.log(result);
        stop();

        confirmDialogStore.removeConfirmDialog(confirmDialogWindowId);
        windowStore.removeOpenWindowReference(confirmDialogWindowId);

        resolve(result.confirmed);
      },
    );
  });
}
