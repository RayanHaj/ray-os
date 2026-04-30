import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFileSystemItem(
  rayDb: RayDb,
  itemIdentifier: FileSystemItem | number,
  onlyFileSystemReference?: boolean,
  updateFileSystem = true,
) {
  if (typeof itemIdentifier === 'number') {
    await deleteFileSystemItem(rayDb, itemIdentifier, onlyFileSystemReference);
  } else {
    await deleteFileSystemItem(rayDb, itemIdentifier.id, onlyFileSystemReference);
  }

  if (updateFileSystem) {
    useFileSystemStore().updateFileSystem();
  }
}
