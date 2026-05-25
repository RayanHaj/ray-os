import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileStore } from '@/stores/file.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/ItemTypes.ts';

export async function useFileSystemInit(rayDb: RayDb) {
  const fileSystemStore = useFileSystemStore();
  const rootDirectory = fileSystemStore.rootDirectory;
  const rootDirectoryId = fileSystemStore.rootId;

  const existingRootDirectory = await rayDb.findOne<FileSystemItem>(
    'fileSystem',
    'id',
    rootDirectoryId,
  );

  // Early escape when initial directories already have been initialized
  if (existingRootDirectory && existingRootDirectory.directory?.name === rootDirectory) return;

  const parentId = await insertItemIntoFileSystem(rayDb, [], {
    directory: { name: rootDirectory, children: [] },
    isSystemFile: true,
  }, undefined, false);

  if (!(parentId instanceof Error)) {
    if (parentId) {
      await insertItemIntoFileSystem(rayDb, [parentId], {
        directory: { name: 'Applications', children: [] },
        isSystemFile: true,
      });
      await insertItemIntoFileSystem(rayDb, [parentId], {
        directory: { name: 'Wallpapers', children: [] },
        isSystemFile: true,
      });
    }
  }

  await useFileStore().initializeFiles(rayDb);
}
