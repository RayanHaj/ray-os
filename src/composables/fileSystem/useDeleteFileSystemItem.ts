import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFileSystemItem(rayDb: RayDb, item?: FileSystemItem, id?: number, onlyFileSystemReference?: boolean) {
  try {
    if (id) {
      await deleteFileSystemItem(rayDb, id, onlyFileSystemReference);
    } else {
      if (item && item.id) {
        await deleteFileSystemItem(rayDb, item.id, onlyFileSystemReference);
      }
    }

    useFileSystemStore().updateFileSystem();
  } catch (e) {
    console.log(e);
  }
}
