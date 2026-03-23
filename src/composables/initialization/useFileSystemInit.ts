import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileStore } from '@/stores/file.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useFileSystemInit(rayDb: RayDb) {
  const fileSystemStore = useFileSystemStore();
  const rootDirectory = fileSystemStore.rootDirectory;
  const parentId = await insertItemIntoFileSystem(rayDb, [], {
    directory: { name: rootDirectory, children: [] },
    isSystemFile: true,
  });

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
