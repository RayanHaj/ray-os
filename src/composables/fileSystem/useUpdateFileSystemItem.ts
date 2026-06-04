import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem, InsertFileSystemItem } from '@/types/itemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export async function useUpdateFileSystemItem(rayDb: RayDb, fileSystemItem: FileSystemItem, updateFileSystem?: boolean) {
  try {
    const id = await rayDb.updateOne<InsertFileSystemItem>('fileSystem', fileSystemItem);

    if (updateFileSystem) {
      useFileSystemStore().updateFileSystem();
    }

    return id !== null;
  } catch (e) {
    console.error(e);
    return false;
  }
}
