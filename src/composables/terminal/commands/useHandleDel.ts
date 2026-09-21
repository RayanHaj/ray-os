import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
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
    const values = await useFileSystemLookup(rayDb, currentPath.value.join('/'));

    if (values instanceof Error) return new Error('could not find value');

    const targetValue = values?.children.filter((child) => {
      if (child.file) {
        return child.file.name === name;
      } else if (child.directory) {
        return child.directory.name === name;
      }
    })[0];

    if (!targetValue || !targetValue.id) {
      return new Error('could not find value');
    }

    try {
      await useDeleteFileSystemItem(rayDb, targetValue.id, { updateFileSystem: true });
    } catch (e) {
      return new Error((e as Error).message);
    }

    lines.value.push({
      line: `${targetValue.directory ? 'directory' : 'file'} (${name}) successfully deleted`,
      isPlain: true,
    });
  } catch (e) {
    return e as Error;
  }
}
