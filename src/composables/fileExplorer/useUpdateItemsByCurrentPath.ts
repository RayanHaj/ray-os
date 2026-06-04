import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { FileSystemItem, Item } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';

export async function useUpdateItemsByCurrentPath(
  rayDb: RayDb,
  path: string,
): Promise<FileSystemItem[]> {
  const fileSystemItems = await fileSystemLookup(rayDb, path);
  if (fileSystemItems instanceof Error || !fileSystemItems) {
    throw new Error(`No fileSystemItems (children) found with specified path: ${path}`);
  }

  return await mapItemsWithType(rayDb, fileSystemItems.children);
}

async function mapItemsWithType(rayDb: RayDb, items: FileSystemItem[]): Promise<FileSystemItem[]> {
  return (await Promise.all(
    items
      .map(async (item) => {
        const updatedItems = { ...item, type: 'directory' };

        if (item.file) {
          const file = await rayDb.findOne<Item>('files', 'id', item.file.id);

          // if file does not exist in the files store but somehow a reference is still in the fileSystem store, it will be deleted
          if (!file) {
            await useDeleteFileSystemItem(rayDb, item, {
              files: { dontDeleteFromFilesStore: false },
              directories: { onlyDeleteParent: true },
              updateFileSystem: true,
            });
            return;
          }

          updatedItems.type = file.content.type;
        }

        return updatedItems;
      })
      .filter((item) => item !== undefined),
  )) as FileSystemItem[];
}
