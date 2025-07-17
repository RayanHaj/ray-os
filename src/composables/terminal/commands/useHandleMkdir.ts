import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';

export async function useHandleMkdir(rayDb: RayDb, currentPath: Ref<string[]>, name: string) {
  const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
  if (value instanceof Error || !value?.parent.id) {
    return;
  }

  await insertItemIntoFileSystem(rayDb, [value.parent.id], {
    directory: { name: name, children: [] },
  });
}
