import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/FileSystemItem.ts';

export async function insertItemIntoFileSystem(rayDb: RayDb, parents: number[], item: {
  file?: { name: string, id: number },
  directory?: { name: string, children: number[] }
}) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  let id = await rayDb.insertOne<FileSystemItem>('fileSystem', {parents: parents, [item.directory ? 'directory' : 'file']: item.directory || item.file})

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

  return id;
}

export async function fileSystemLookupChildren(rayDb: RayDb, names: string[] | string) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  if (typeof names === 'string') {
    names = parseStringIntoRecursionArray(names);
  }

  const fileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');
  const rootItem = fileSystemItems.filter(fileSystemItem => fileSystemItem.directory?.name === names[0])[0];

  if (fileSystemItems === undefined) {
    console.error(`no directory found with name ${names[0]}`);
    return;
  }

  names.splice(0, 1);

  const value = await doRecursion(rayDb, rootItem, names);
  if (value && value.directory) {
    if (value.directory.children.length === 0) {
      return;
    }

    const children: FileSystemItem[] = [];
    for (const childId of value.directory.children) {
      const child = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', childId);
      children.push(child);
    }

    return children;
  }
}
export async function fileSystemLookup(rayDb: RayDb, names: string[] | string) {
  if (rayDb === undefined) {
    console.error('indexed database not defined');
    return;
  }

  if (typeof names === 'string') {
    names = parseStringIntoRecursionArray(names);
  }

  const startPoint = await rayDb.findOne<FileSystemItem>('fileSystem', 'directory', names[0]);
  names.splice(0, 1);

  return await doRecursion(rayDb, startPoint, names);
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
