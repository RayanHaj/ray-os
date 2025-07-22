import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFileSystemItem(rayDb: RayDb, item?: FileSystemItem, id?: number) {
  if (item && item.id) {
    if (item.directory) {
      await deleteFileSystemItem(rayDb, item.id);
    } else if (item.file) {
      await deleteFileSystemItem(rayDb, item.file.id);
    }
  } else if (id) {
    await deleteFileSystemItem(rayDb, id);
  }

  useFileSystemStore().updateFileSystem();
}
