import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { updateFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';

export async function useRenameDirectory(rayDb: RayDb, fileSystemItem: FileSystemItem, newDirectoryName: string, windowId: string) {
  if (!fileSystemItem.directory) return;

  fileSystemItem.directory.name = newDirectoryName.trim();

  await updateFileSystemItem(rayDb, fileSystemItem, true);

  await useDesktopStore().updateTiles(rayDb);
  useFileSystemStore().updateFileSystem();
}
