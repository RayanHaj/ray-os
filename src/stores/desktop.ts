import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FileItem, FileSystemItem, Item, ItemInsert } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useToastStore } from '@/stores/toast.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { DesktopItem, DesktopTileItem } from '@/types/desktopTypes.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';

export const useDesktopStore = defineStore('desktop', () => {
  const tileWidth = ref(85);
  const tileHeight = ref(85);
  const items = ref<DesktopTileItem[]>([]);

  async function initializeTileContent(rayDb: RayDb) {
    if (localStorage.getItem('desktopFilesInitialized') === 'initialized') {
      await updateTiles(rayDb);
      return;
    }

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

    const applicationFiles = (await rayDb.findAll<Item>('files')).filter(
      (file) => file.content.type === 'application',
    );

    for (const file of applicationFiles) {
      const index = applicationFiles.indexOf(file);
      await addDesktopItem(rayDb, { id: file.id, type: file.content.type, tileId: index + 1 });
    }

    localStorage.setItem('desktopFilesInitialized', 'initialized');
    await updateTiles(rayDb);
  }

  async function updateTiles(rayDb: RayDb) {
    const desktopItems = await getDesktopItems(rayDb);
    if (!desktopItems) {
      return;
    }

    items.value = [];

    for (const item of desktopItems) {
      if (item.type === 'directory') {
        const directoryItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', item.id);
        if (!directoryItem.directory) {
          continue;
        }

        if (directoryItem) {
          items.value = [
            ...items.value,
            {
              label: directoryItem.directory.name,
              content: directoryItem,
              id: directoryItem.id,
              tileId: item.tileId,
              path: item.path,
            } as Item & { tileId: number },
          ];
        }
      } else {
        const fileItem = await rayDb.findOne<Item>('files', 'id', item.id);
        if (fileItem) {
          items.value = [...items.value, { ...fileItem, tileId: item.tileId, path: item.path }];
        }
      }
    }
  }

  async function updateDesktopItem(
    rayDb: RayDb,
    desktopItemId: number,
    newTileId: number,
    type: string,
  ) {
    try {
      const storeItem = items.value.find(
        (item) => item.id === desktopItemId && item.content.type === type,
      );
      if (!storeItem) throw new Error('cannot find item');

      const item = await rayDb.findOne<DesktopItem>('desktopFiles', 'tileId', storeItem.tileId);
      if (!item) throw new Error('cannot find item in db');

      const oldTileId = item.tileId;
      item.tileId = newTileId;

      await rayDb.deleteOne('desktopFiles', oldTileId);
      await rayDb.insertOne<DesktopItem>('desktopFiles', item);

      items.value = items.value.map((item) => {
        if (item.id === desktopItemId && item.content.type === type) {
          item.tileId = newTileId;
          return item;
        }
        return item;
      });
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }

  async function addDesktopItem(rayDb: RayDb, desktopItem: DesktopItem) {
    try {
      const existingItems = await rayDb.findAll<DesktopItem>('desktopFiles');
      const alreadyOnDesktop = existingItems.some(
        (item) => item.id === desktopItem.id && item.type === desktopItem.type,
      );

      if (alreadyOnDesktop) {
        useToastStore().createToast('Item already on desktop', 'error', 3000, 'desktop');
        return;
      }

      let item: (Item & { tileId: number }) | null = null;

      switch (desktopItem.type) {
        case 'file':
        case 'application':
          {
            item = await rayDb.findOne<Item & { tileId: number }>('files', 'id', desktopItem.id);
          }
          break;
        case 'directory': {
          const fileSystemItem = await rayDb.findOne<FileSystemItem>(
            'fileSystem',
            'id',
            desktopItem.id,
          );

          if (!fileSystemItem.directory) {
            throw new Error('Could not insert desktop item');
          }

          item = {
            label: fileSystemItem.directory.name,
            content: fileSystemItem,
            id: fileSystemItem.id,
          } as Item & { tileId: number };
        }
      }

      if (!item) {
        throw new Error('Could not insert desktop item');
      }

      const itemId = await rayDb.insertOne<DesktopItem>('desktopFiles', desktopItem);
      if (!itemId) {
        throw new Error('Could not insert desktop item');
      }

      item.tileId = desktopItem.tileId;
      item.path = desktopItem.path;
      items.value = [...items.value, item];
    } catch (e) {
      if ((e as Error).name === 'ConstraintError') {
        useToastStore().createToast('file already added to the desktop', 'error', 3000, 'desktop');
        return;
      }
      throw (e as Error).message;
    }
  }

  async function deleteDesktopItem(rayDb: RayDb, tileId: number) {
    await rayDb.deleteOne('desktopFiles', tileId);
    items.value = items.value.filter((item) => item.tileId !== tileId);
  }

  const getDesktopItems = async (rayDb: RayDb) => await rayDb.findAll<DesktopItem>('desktopFiles');

  function getDesktopItemByTileId(tileId: number) {
    try {
      return items.value.find((item) => item.tileId === tileId);
    } catch (e) {
      throw (e as Error).message;
    }
  }

  return {
    items,
    tileWidth,
    tileHeight,
    updateTiles,
    initializeTileContent,
    addDesktopItem,
    deleteDesktopItem,
    updateDesktopItem,
    getDesktopItems,
    getDesktopItemByTileId,
  };
});
