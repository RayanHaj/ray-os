import type { FileSystemItem } from '@/types/ItemTypes.ts';
import type { Ref } from 'vue';
import {
  useUpdateItemsByCurrentPath
} from '@/composables/fileExplorer/useUpdateItemsByCurrentPath.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useHandleExplorerDirectoryClicked(
  id: number,
  directory: { name: string; children: number[] },
  previousItems: Ref<Array<Array<FileSystemItem & { type: string }>>>,
  currentItems: Ref<Array<FileSystemItem & { type: string }>>,
  currentParentItemId: Ref<number | undefined>,
  currentPath: Ref<string[]>,
  rayDb: RayDb
) {
  previousItems.value.push(currentItems.value);

  const newPath = `${currentPath.value.join('/')}/${directory.name}`;
  await useUpdateItemsByCurrentPath(rayDb, newPath, currentItems);

  currentPath.value.push(directory.name);
  currentParentItemId.value = id;
}

// typeof ref<Array<Array<FileSystemItem & { type: string }>>>
