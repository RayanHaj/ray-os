import type { FileSystemItem } from '@/types/itemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFileSystemItem(
  rayDb: RayDb,
  itemIdentifier: FileSystemItem | number,
  onlyFileSystemReference?: boolean,
  onlyTopLevel?: boolean,
  updateFileSystem = true,
) {
  if (typeof itemIdentifier === 'number') {
    await deleteFileSystemItem(rayDb, itemIdentifier, onlyFileSystemReference, onlyTopLevel);
  } else {
    await deleteFileSystemItem(rayDb, itemIdentifier.id, onlyFileSystemReference, onlyTopLevel);
  }

  if (updateFileSystem) {
    useFileSystemStore().updateFileSystem();
  }
}
