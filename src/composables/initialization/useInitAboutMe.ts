import type { RayDb } from 'ray-db-wrapper';
import type { FileItem, Item, ItemInsert } from '@/types/itemTypes.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useToastStore } from '@/stores/toast.ts';

export async function useInitAboutMe(rayDb: RayDb) {
  const response = await fetch('/rayosinformation.txt');
  const blob = await response.blob();
  const file = new File([blob], 'README.txt', { type: 'text/plain' });

  const fileObject: FileItem = {
    type: 'file',
    name: file.name,
    size: file.size,
    createdAt: file.lastModified.toString(),
    rawFile: file,
  };

  try {
    const fileItems = await rayDb.findAll<Item>('files');

    const foundReadMe = fileItems.some((item) => {
      if (item.content.type !== 'file') return;
      if (!item.content.rawFile || !fileObject.rawFile) return;
      return (
        item.content.rawFile.type === fileObject.rawFile.type &&
        item.content.rawFile.name === fileObject.rawFile.name &&
        item.content.rawFile.size === fileObject.rawFile.size
      );
    });

    if (!foundReadMe) {
      const fileId = await rayDb.insertOne<ItemInsert>('files', {
        label: fileObject.name,
        content: fileObject,
      });

      if (fileId && typeof fileId === 'number') {
        await useInsertFileSystemItem(rayDb, [useFileSystemStore().ROOT_DIR_ID], {
          file: { name: fileObject.name, id: fileId, type: file.type },
          isSystemFile: true,
        });

        const applicationFiles = (await rayDb.findAll<Item>('files')).filter(
          (file) => file.content.type === 'application',
        );

        await useDesktopStore().addDesktopItem(rayDb, {
          id: fileId,
          tileId: applicationFiles.length + 1,
          type: 'file',
        });
      }
    }
  } catch (e) {
    useToastStore().createToast((e as Error).message, 'error', 5000, 'desktop');
  }
}
