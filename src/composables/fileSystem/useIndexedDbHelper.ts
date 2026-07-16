import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/itemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useGetRootDirectory } from '@/composables/fileSystem/useGetRootDirectory.ts';

export async function useFileSystemLookup(
  rayDb: RayDb,
  path: string,
): Promise<Error | { parent: FileSystemItem; children: FileSystemItem[] } | undefined> {
  try {
    const pathArray: string[] = useParseToPathArray(path, true);
    const rootDirectoryId = await useGetRootDirectory(rayDb, true);

    if (!rootDirectoryId) {
      return;
    }

    const fileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');
    const startPoint = fileSystemItems.find((fileSystemItem) => {
      const isRootDirectory =
        fileSystemItem.directory?.name === useFileSystemStore().ROOT_DIR_NAME &&
        fileSystemItem.id === rootDirectoryId;
      const isItemInRootDirectory = fileSystemItem.parents.includes(rootDirectoryId);

      return (
        fileSystemItem.directory?.name === pathArray[0] &&
        (isRootDirectory || isItemInRootDirectory)
      );
    });

    if (fileSystemItems.length === 0 || !startPoint) {
      throw new Error(`no directory found with name ${pathArray[0]}`);
    }

    pathArray.splice(0, 1);

    const value = await useGetFileSystemItem(rayDb, startPoint, pathArray);
    if (value && value.directory) {
      if (value.directory.children.length === 0) {
        return { parent: value, children: [] };
      }

      const children: FileSystemItem[] = [];
      for (const childId of value.directory.children) {
        const child = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', childId);
        if (child) {
          children.push(child);
        }
      }

      return { parent: value, children: children };
    }
  } catch (e) {
    return e as Error;
  }
}

/**
 * Recursively searches through the given path array starting from startItem,
 * and returns the final FileSystemItem that matches the last path segment.
 * @param rayDb
 * @param startItem
 * @param pathArray
 * @returns The FileSystemItem found at the end of the path, or undefined if not found.
 */
export async function useGetFileSystemItem(
  rayDb: RayDb,
  startItem: FileSystemItem,
  pathArray: string[],
) {
  if (pathArray.length === 0) {
    return startItem;
  }
  if (!startItem.directory) {
    console.error('property: directory, does not exist on startPoint');
    return;
  }

  const nextPathName = pathArray[0];
  let currentItem: FileSystemItem;

  for (const child of startItem.directory.children) {
    currentItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);
    if (
      currentItem &&
      (currentItem.directory?.name === nextPathName || currentItem.file?.name === nextPathName)
    ) {
      pathArray.shift();
      return await useGetFileSystemItem(rayDb, currentItem, pathArray);
    }
  }
}

export function useParseToPathString(value: string[]) {
  return value.join('/');
}

export function useParseToPathArray(value: string, excludeRoot = false) {
  if (excludeRoot) {
    return value.replace('C:/', '').split('/');
  }

  return value.split('/');
}

//TODO: IMPLEMENT A FUNCTION RECURSIVELY BUILDING A PATH STARTING FROM A PARENT ID TO THE ROOT DIR
export async function useBuildPathToRootFromParentId(rayDb: RayDb, parentId: number): Promise<string> {
  const pathArray: string[] = [];

  await useBuildPathToRootHelper(rayDb, pathArray, parentId);

  pathArray.reverse();

  return useParseToPathString(pathArray);
}

async function useBuildPathToRootHelper(rayDb: RayDb, pathArray: string[], parentId: number) {
  if (parentId === useFileSystemStore().ROOT_DIR_ID) {
    pathArray.push(useFileSystemStore().ROOT_DIR_NAME);
    return;
  }

  const parentItem: FileSystemItem = await rayDb.findOne<FileSystemItem>(
    'fileSystem',
    'id',
    parentId,
  );

  if (parentItem.file || !parentItem.directory || !parentId) return;

  pathArray.push(parentItem.directory.name);
  return useBuildPathToRootHelper(rayDb, pathArray, parentItem.parents[0]);
}
