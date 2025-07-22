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

  const childNameArray = [];
  let extension = '';
  for (const child of value.children) {
    const directory = child.directory;
    const file = child.file;

    if (directory) {
      childNameArray.push(directory.name);
      extension = 'directory';
    } else if (file) {
      childNameArray.push(file.name);
      extension = 'application';
    }
  }

  if (childNameArray.length === 0) {
    lines.value.push({ line: `[]`, isPlain: true });
    return;
  }

  lines.value.push({
    line: childNameArray.map((value) => `[${value}]: ${extension}`).join('\n'),
    isPlain: true,
  });
}
