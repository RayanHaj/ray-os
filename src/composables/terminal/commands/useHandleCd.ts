import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';

export async function useHandleCd(rayDb: RayDb, currentPath: Ref<string[]>, value: string) {
  const copy = [...currentPath.value, value];
  const item = await fileSystemLookup(rayDb, copy.join('/'));
  if (!item || item instanceof Error) {
    return new Error(`no directory found with name '${value}'`);
  }

  currentPath.value = copy;
}
