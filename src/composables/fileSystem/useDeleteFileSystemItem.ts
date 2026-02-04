import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { deleteFileSystemItem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useDeleteFileSystemItem(rayDb: RayDb, item?: FileSystemItem, id?: number) {
  try {
    if (id) {
      await deleteFileSystemItem(rayDb, id);
    } else {
      if (item && item.id) {
        await deleteFileSystemItem(rayDb, item.id);
      }
    }

    useFileSystemStore().updateFileSystem();
  } catch (e) {
    console.log(e);
  }
}
