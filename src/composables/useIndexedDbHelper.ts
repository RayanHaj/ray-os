import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export async function insertItemIntoFileSystem(
  rayDb: RayDb,
  parents: number[],
  item: {
    file?: { name: string; id: number };
    directory?: { name: string; children: number[] };
  },
) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  const foundItems = await rayDb.findAll<FileSystemItem>('fileSystem');
  if (foundItems.filter(foundItem =>
    foundItem.directory?.name === useFileSystemStore().rootDirectory &&
    item.directory?.name === useFileSystemStore().rootDirectory
  ).length === 1) {
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

export async function getRootDirectory(rayDb: RayDb) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  return await fileSystemLookup(rayDb, useFileSystemStore().rootDirectory);
}

export async function fileSystemLookupChildren(rayDb: RayDb, path: string) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  const pathArray: string[] = parseStringIntoRecursionArray(path);
  console.log(pathArray);
  const rootDirectoryId = await getRootDirectory(rayDb).then((value) =>
    value ? value[0].id : null,
  );
  if (!rootDirectoryId) {
    return;
  }

  const fileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');
  const rootItem = fileSystemItems.filter((fileSystemItem) => {
    return (
      fileSystemItem.directory?.name === pathArray[0] &&
      (fileSystemItem.directory.name === useFileSystemStore().rootDirectory ||
        fileSystemItem.parents.includes(rootDirectoryId))
    );
  })[0];

  if (fileSystemItems.length === 0) {
    console.error(`no directory found with name ${pathArray[0]}`);
    return;
  }

  pathArray.splice(0, 1);

  const value = await doRecursion(rayDb, rootItem, pathArray);
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
export async function fileSystemLookup(rayDb: RayDb, name: string) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  const items = await rayDb.findAll<FileSystemItem>('fileSystem');
  return items.filter((item) => {
    if (item.directory) {
      return item.directory.name === name;
    } else if (item.file) {
      return item.file.name === name;
    }
    return;
  });
}

async function doRecursion(rayDb: RayDb, startPoint: FileSystemItem, names: string[]) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  if (typeof names[0] === 'undefined' || names.length === 0) {
    return startPoint;
  }

  let item: FileSystemItem = startPoint;

  if (!startPoint.directory) {
    console.error('property: directory, does not exist on startPoint');
    return;
  }

  for (const child of startPoint.directory.children) {
    item = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);

    if (item.directory) {
      if (names[0] === item.directory.name) {
        names.splice(0, 1);
        return await doRecursion(rayDb, item, names);
      }
    } else if (item.file) {
      if (names[0] === item.file.name) {
        names.splice(0, 1);
        return await doRecursion(rayDb, item, names);
      }
    }
  }
}

function parseStringIntoRecursionArray(value: string) {
  return value.replace('C:/', '').split('/');
}
