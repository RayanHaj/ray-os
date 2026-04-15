import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { FileSystemItem, Item } from '@/types/ItemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useUpdateItemsByCurrentPath(
  rayDb: RayDb,
  path: string
) {
  const fileSystemItems = await fileSystemLookup(rayDb, path);
  if (fileSystemItems instanceof Error || !fileSystemItems) {
    throw new Error(`No fileSystemItems (children) found with specified path: ${path}`);
  }

  return await mapItemsWithType(rayDb, fileSystemItems.children);
}

async function mapItemsWithType(rayDb: RayDb, items: FileSystemItem[]) {
  return await Promise.all(
    items.map(async (item) => {
      const updatedItems = { ...item, type: 'directory' };

      if (item.file) {
        const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
        updatedItems.type = file.content.type;
      }

      return updatedItems;
    }),
  );
}
