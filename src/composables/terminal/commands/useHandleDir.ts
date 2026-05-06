import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Item } from '@/types/ItemTypes.ts';
import type { LineTerminal } from '@/types/TerminalTypes.ts';

export async function useHandleDir(rayDb: RayDb, currentPath: Ref<string[]>, lines: Ref<LineTerminal[]>) {
  const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
  if (value instanceof Error || !value?.children) {
    return;
  }

  const childNames: Array<{ fileName: string; fileType: string }> = [];
  for (const child of value.children) {
    const directory = child.directory;
    const file = child.file;

    if (directory) {
      childNames.push({ fileName: directory.name, fileType: 'directory' });
    } else if (file) {
      childNames.push({ fileName: file.name, fileType: await getFileTypeByFileId(rayDb, file.id) });
    }
  }

  if (childNames.length === 0) {
    lines.value.push({ line: `[]`, isPlain: true });
    return;
  }

  lines.value.push({
    line: childNames.map((value) => `[${value.fileName}]: ${value.fileType}`).join('\n'),
    isPlain: true,
  });
}

async function getFileTypeByFileId(rayDb: RayDb, id: number): Promise<string> {
  const file = await rayDb.findOne<Item>('files', 'id', id);
  if (!file) {
    return '';
  }

  return file.content.type;
}
