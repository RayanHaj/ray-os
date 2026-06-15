import { useToastStore } from '@/stores/toast.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { SystemFileDeleteError } from '@/exceptions/systemFileDeleteError.ts';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import type { FileSystemItem } from '@/types/itemTypes.ts';

export async function useOnDeleteItems(
  rayDb: RayDb,
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  currentFileSystemItems: FileSystemItem[],
  windowId: string,
) {
  await multiSelect.forEachSelected(async (id) => {
    const fileSystemItem = currentFileSystemItems.find((item) => item.id === id);
    if (fileSystemItem) {
      if (fileSystemItem.isSystemFile) {
        useToastStore().createToast(
          'cannot delete system files',
          'error',
          5000,
          'window',
          windowId,
        );

        return;
      }

      try {
        await useDeleteFileSystemItem(rayDb, fileSystemItem.id);
      } catch (e) {
        if (e instanceof SystemFileDeleteError) {
          useToastStore().createToast(
            'cannot delete system files',
            'error',
            5000,
            'window',
            windowId,
          );
        }
      }
    }
  });

  await useDesktopStore().updateTiles(rayDb);
  useFileSystemStore().updateFileSystem();
}
