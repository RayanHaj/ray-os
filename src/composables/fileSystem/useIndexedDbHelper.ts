import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useGetRootDirectory } from '@/composables/fileSystem/useGetRootDirectory.ts';
import { useHandleIDBFileOperations } from '@/composables/fileSystem/useHandleIDBFileOperations.ts';
import { useToastStore } from '@/stores/toast.ts';

function insertionCheck(
  foundItems: FileSystemItem[],
  item: { file?: { name: string; id: number }; directory?: { name: string; children: number[] } },
  parents: number[],
) {
  if (item.file) {
    let state: boolean | Error = true;
    if (item.file.name.trim().length === 0) {
      return new Error('provide a file name');
    }

    foundItems.some((foundItem) => {
      const alreadyExists =
        foundItem.parents.some((parent) => parents.includes(parent)) &&
        foundItem.file?.name === item.file?.name;

      if (alreadyExists) {
        state = new Error(`file (${item.file?.name}) already exists in directory`);
        return true;
      }
    });

    return state;
  } else if (item.directory) {
    let state: boolean | Error = true;
    if (item.directory.name.trim().length === 0) {
      return new Error('provide a directory name');
    }

    foundItems.some((foundItem) => {
      const isRootDirectoryName =
        foundItem.directory?.name === useFileSystemStore().rootDirectory &&
        item.directory?.name === useFileSystemStore().rootDirectory;

      const hasDirectoryWithSameName =
        foundItem.parents.some((parent) => parents.includes(parent)) &&
        foundItem.directory?.name === item.directory?.name;

      if (isRootDirectoryName) {
        state = new Error(`directory cannot be named after root directory`);
        return true;
      } else if (hasDirectoryWithSameName) {
        state = new Error(`directory (${item.directory?.name}) already exists in directory`);
        return true;
      }
    });

    return state;
  }
  return new Error('non existing item found');
}

export async function insertItemIntoFileSystem(
  rayDb: RayDb,
  parents: number[],
  item: { file?: { name: string; id: number }; directory?: { name: string; children: number[] }, isSystemFile?: boolean },
): Promise<Error | number | undefined> {
  try {
    const foundItems = await rayDb.findAll<FileSystemItem>('fileSystem');

    const check = insertionCheck(foundItems, item, parents);
    if (check && check instanceof Error) {
      throw check;
    }

    if (!item.isSystemFile) {
      item.isSystemFile = false;
    }


    let id = await rayDb.insertOne<FileSystemItem>('fileSystem', {
      parents: parents,
      [item.directory ? 'directory' : 'file']: item.directory || item.file,
      isSystemFile: item.isSystemFile
    });

    if (Number.isNaN(id)) return new Error('hello');
    id = id as number;

    for (const parentId of parents) {
      const parent = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', parentId);
      if (parent.directory !== undefined) {
        if (!parent.directory.children.includes(id)) {
          parent.directory.children.push(id);
          await rayDb.updateOne<FileSystemItem>('fileSystem', parent);
        }
      }
    }

    useFileSystemStore().updateFileSystem();
    return id;
  } catch (e) {
    return e as Error;
  }
}

export async function fileSystemLookup(
  rayDb: RayDb,
  path: string,
): Promise<Error | { parent: FileSystemItem; children: FileSystemItem[] } | undefined> {
  try {
    const pathArray: string[] = parseToPathArray(path);
    const rootDirectoryId = await useGetRootDirectory(rayDb, true);

    if (!rootDirectoryId) {
      return;
    }

    const fileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');
    const startPoint = fileSystemItems.find((fileSystemItem) => {
      const isRootDirectory =
        fileSystemItem.directory?.name === useFileSystemStore().rootDirectory &&
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

    const value = await getFileSystemItem(rayDb, startPoint, pathArray);
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
export async function getFileSystemItem(
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
      return await getFileSystemItem(rayDb, currentItem, pathArray);
    }
  }
}

export async function deleteFileSystemItem(rayDb: RayDb, id: number) {
  const parent: FileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', id);
  if (!parent || !parent.id) {
    return;
  }

  if (parent.isSystemFile) {
    useToastStore().createToast('cannot delete system files', 'error', 5000, 'desktop');
    throw new Error('cannot delete system files');
  }

  if (parent.file) {
    await useHandleIDBFileOperations(rayDb).remove(parent.file.id, parent.id, 'file');
  } else if (parent.directory) {
    await rayDb.deleteOne('fileSystem', parent.id);

    for (const child of parent.directory.children) {
      const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);
      if (!fileSystemItem.id) {
        continue;
      }

      if (fileSystemItem.file) {
        await useHandleIDBFileOperations(rayDb).remove(fileSystemItem.file.id, fileSystemItem.id, 'file');
      } else if (fileSystemItem.directory) {
        await deleteFileSystemItem(rayDb, fileSystemItem.id);
      }
    }
  }
}

function parseToPathArray(value: string) {
  return value.replace('C:/', '').split('/');
}
