import type { RayDb } from 'ray-db-wrapper';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Ref } from 'vue';

export async function useHandleCd(rayDb: RayDb, commandValue: string, currentPath: Ref<string[]>) {
  const copy = [...currentPath.value, commandValue];
  const item = await fileSystemLookup(rayDb, copy.join('/'));
  if (!item || item instanceof Error) {
    return new Error(`no directory found with name '${commandValue}'`);
  }

  currentPath.value = copy;
}
