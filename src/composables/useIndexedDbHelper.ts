import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/ItemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useGetRootDirectory } from '@/composables/useGetRootDirectory.ts';

export async function insertItemIntoFileSystem(
  rayDb: RayDb,
  parents: number[],
  item: { file?: { name: string; id: number }; directory?: { name: string; children: number[] } },
) {
  const foundItems = await rayDb.findAll<FileSystemItem>('fileSystem');
  if (
    foundItems.filter(
      (foundItem) =>
        foundItem.directory?.name === useFileSystemStore().rootDirectory &&
        item.directory?.name === useFileSystemStore().rootDirectory,
    ).length === 1
  ) {
    return;
  }

  let id = await rayDb.insertOne<FileSystemItem>('fileSystem', {
    parents: parents,
    [item.directory ? 'directory' : 'file']: item.directory || item.file,
  });

  if (Number.isNaN(id)) return;

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
}

export async function fileSystemLookup(rayDb: RayDb, path: string) {
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
      fileSystemItem.directory?.name === pathArray[0] && (isRootDirectory || isItemInRootDirectory)
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
  if (!parent) {
    return;
  }

  if (parent.file) {
    await rayDb.deleteOne('fileSystem', parent.file.id);
    await rayDb.deleteOne('files', parent.file.id);
    return;
  }

  if (parent.directory && parent.id) {
    await rayDb.deleteOne('fileSystem', parent.id);

    let currentItem: FileSystemItem;
    for (const child of parent.directory.children) {
      currentItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);
      if (currentItem.id)
        if (currentItem.directory) {
          await deleteFileSystemItem(rayDb, currentItem.id);
        } else if (currentItem.file) {
          await rayDb.deleteOne('fileSystem', currentItem.id);
          await rayDb.deleteOne('files', currentItem.id);
        }
    }
  }
}

function parseToPathArray(value: string) {
  return value.replace('C:/', '').split('/');
}
