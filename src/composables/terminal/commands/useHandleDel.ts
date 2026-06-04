import type { RayDb } from 'ray-db-wrapper';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import type { Ref } from 'vue';
import type { LineTerminal } from '@/types/terminalTypes.ts';

export async function useHandleDel(
  rayDb: RayDb,
  name: string,
  currentPath: Ref<string[]>,
  lines: Ref<LineTerminal[]>,
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
      await useDeleteFileSystemItem(rayDb, targetValue, { updateFileSystem: true });
    } catch (e) {
      return new Error((e as Error).message);
    }

    lines.value.push({ line: `directory (${name}) successfully deleted`, isPlain: true });
  } catch (e) {
    return e as Error;
  }
}
