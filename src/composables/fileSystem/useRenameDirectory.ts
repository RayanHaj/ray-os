import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/itemTypes.ts';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useToastStore } from '@/stores/toast.ts';
import { SystemFileRenameError } from '@/exceptions/systemFileRenameError.ts';
import { useUpdateFileSystemItem } from '@/composables/fileSystem/useUpdateFileSystemItem.ts';

export async function useRenameDirectory(
  rayDb: RayDb,
  fileSystemItem: FileSystemItem,
  newDirectoryName: string,
  windowId: string,
) {
  try {
    if (!fileSystemItem.directory) throw new Error('This fileSystemItem is not of type "directory"');
    if (fileSystemItem.isSystemFile) throw new SystemFileRenameError('Cannot rename system files');

    fileSystemItem.directory.name = newDirectoryName.trim();

    await useUpdateFileSystemItem(rayDb, fileSystemItem, true);

    await useDesktopStore().updateTiles(rayDb);
    useFileSystemStore().updateFileSystem();
  } catch (e) {
    console.error(e);
    if (e instanceof SystemFileRenameError) {
      useToastStore().createToast(e.message, 'error', 5000, 'window', windowId);
    }
  }
}
