import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { LineTerminal } from '@/types/TerminalTypes.ts';

export async function useHandleMkdir(
  rayDb: RayDb,
  lines: Ref<LineTerminal[]>,
  currentPath: Ref<string[]>,
  name: string,
): Promise<Error | undefined> {
  try {
    const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
    if (value instanceof Error) {
      throw value;
    }

    if (!value?.parent.id) {
      throw new Error('cannot create directory at current path');
    }

    const insertValue = await insertItemIntoFileSystem(rayDb, [value.parent.id], {
      directory: { name: name, children: [] },
    });

    if (insertValue instanceof Error) {
      throw insertValue;
    }

    const successMassage = `created directory (${name}) in '${currentPath.value.join('/')}'`;
    lines.value.push({ line: successMassage, isPlain: true });
  } catch (error) {
    return error as Error;
  }
}
