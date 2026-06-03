import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileStore } from '@/stores/file.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/itemTypes.ts';

export async function useFileSystemInit(rayDb: RayDb) {
  const fileSystemStore = useFileSystemStore();

  const existingRootDirectory = await rayDb.findOne<FileSystemItem>(
    'fileSystem',
    'id',
    fileSystemStore.ROOT_DIR_ID,
  );

  // Early escape when initial directories already have been initialized
  if (existingRootDirectory && existingRootDirectory.directory?.name === fileSystemStore.ROOT_DIR_NAME) {
    await useFileStore().initializeFiles(rayDb);
    return;
  }

  try {
    const parentId = await insertItemIntoFileSystem(rayDb, [], {
      directory: { name: fileSystemStore.ROOT_DIR_NAME, children: [] },
      isSystemFile: true,
    }, undefined, false);

      if (parentId) {
        await insertItemIntoFileSystem(rayDb, [parentId], {
          directory: { name: 'Applications', children: [] },
          isSystemFile: true,
        }, undefined, false);
        await insertItemIntoFileSystem(rayDb, [parentId], {
          directory: { name: 'Wallpapers', children: [] },
          isSystemFile: true,
        }, undefined, false);
      }

    await useFileStore().initializeFiles(rayDb);
  } catch (e) {
    console.error(e);
  }
}
