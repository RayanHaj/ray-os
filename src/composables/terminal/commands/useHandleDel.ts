import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';

export async function useHandleDel(
  rayDb: RayDb,
  lines: Ref<Array<{ line: string; isPlain: boolean }>>,
  currentPath: Ref<string[]>,
  name: string,
): Promise<Error | undefined> {
  try {
    const values = await fileSystemLookup(rayDb, currentPath.value.join('/'));
    if (values instanceof Error) {
      return new Error('could not find value');
    }

    const targetValue = values?.children.filter((child) => child.directory?.name === name)[0];
    if (!targetValue || !targetValue.id) {
      return new Error('could not find value');
    }

    try {
      await useDeleteFileSystemItem(rayDb, targetValue.id);
    } catch (e) {
      return new Error((e as Error).message);
    }

    lines.value.push({ line: `directory (${name}) successfully deleted`, isPlain: true });
  } catch (e) {
    return e as Error;
  }
}
