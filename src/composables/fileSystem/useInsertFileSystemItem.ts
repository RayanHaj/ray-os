import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem, InsertFileSystemItem } from '@/types/itemTypes.ts';
import { FileSystemInsertionError } from '@/exceptions/fileSystemInsertionError.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export async function useInsertFileSystemItem(
  rayDb: RayDb,
  parents: number[],
  item: {
    file?: { name: string; id: number; type: string };
    directory?: { name: string; children: number[] };
    isSystemFile?: boolean;
  },
  updateFileSystem = true,
  performInsertionCheck = true,
): Promise<number> {
  try {
    const foundItems = await rayDb.findAll<FileSystemItem>('fileSystem');

    if (performInsertionCheck) {
      const check = insertionCheck(foundItems, item, parents);
      if (check && check instanceof Error) {
        throw check;
      }
    }

    if (!item.isSystemFile) {
      item.isSystemFile = false;
    }

    let id = await rayDb.insertOne<InsertFileSystemItem>('fileSystem', {
      parents: parents,
      [item.directory ? 'directory' : 'file']: item.directory || item.file,
      isSystemFile: item.isSystemFile,
      type: 'directory',
    });

    if (Number.isNaN(id)) {
      throw FileSystemInsertionError;
    }

    id = id as number;

    for (const parentId of parents) {
      const parent = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', parentId);
      if (parent.directory !== undefined) {
        if (!parent.directory.children.includes(id)) {
          parent.directory.children.push(id);
          await rayDb.updateOne<InsertFileSystemItem>('fileSystem', parent);
        }
      }
    }

    if (updateFileSystem) {
      useFileSystemStore().updateFileSystem();
    }
    return id;
  } catch (e) {
    throw e;
  }
}

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
        foundItem.directory?.name === useFileSystemStore().ROOT_DIR_NAME &&
        item.directory?.name === useFileSystemStore().ROOT_DIR_NAME;

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
