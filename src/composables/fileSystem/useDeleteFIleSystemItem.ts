import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFIleSystemItem(rayDb: RayDb, item: FileSystemItem) {
  if (!item) {
    return;
  }
  if (!item.id) {
    return;
  }

  if (item.directory) {
    await deleteFileSystemItem(rayDb, item.id);
  } else if (item.file) {
    await deleteFileSystemItem(rayDb, item.file.id);
  }

  useFileSystemStore().updateFileSystem();
}
