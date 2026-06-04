import type { RayDb } from 'ray-db-wrapper';
import {
  fileSystemLookup,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Ref } from 'vue';
import type { LineTerminal } from '@/types/terminalTypes.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';

export async function useHandleMkdir(
  rayDb: RayDb,
  name: string,
  currentPath: Ref<string[]>,
  lines: Ref<LineTerminal[]>,
): Promise<Error | undefined> {
  try {
    const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
    if (value instanceof Error) {
      throw value;
    }

    if (!value?.parent.id) {
      throw new Error('cannot create directory at current path');
    }

    await useInsertFileSystemItem(rayDb, [value.parent.id], {
      directory: { name: name, children: [] },
    });

    const successMassage = `created directory (${name}) in '${currentPath.value.join('/')}'`;
    lines.value.push({ line: successMassage, isPlain: true });
  } catch (error) {
    return error as Error;
  }
}
