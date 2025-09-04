import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';

export async function useHandleDir(
  rayDb: RayDb,
  currentPath: Ref<string[]>,
  lines: Ref<Array<{ line: string; isPlain: boolean }>>,
) {
  const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
  if (value instanceof Error || !value?.children) {
    return;
  }

  const childNames = [];
  let extension = '';
  for (const child of value.children) {
    const directory = child.directory;
    const file = child.file;

    if (directory) {
      childNames.push(directory.name);
      extension = 'directory';
    } else if (file) {
      childNames.push(file.name);
      extension = 'application';
    }
  }

  if (childNames.length === 0) {
    lines.value.push({ line: `[]`, isPlain: true });
    return;
  }

  lines.value.push({
    line: childNames.map((value) => `[${value}]: ${extension}`).join('\n'),
    isPlain: true,
  });
}
