import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Ref } from 'vue';

export async function useHandleCd(rayDb: RayDb, commandValue: string, currentPath: Ref<string[]>) {
  const updatedPath = [...currentPath.value, commandValue];

  const foundDirectory = await useFileSystemLookup(rayDb, updatedPath.join('/'));

  if (
    !foundDirectory ||
    foundDirectory instanceof Error ||
    (foundDirectory && !foundDirectory.parent.directory)
  )
    return new Error(`no directory found with name '${commandValue}'`);

  currentPath.value = updatedPath;
}
