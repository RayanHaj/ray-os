import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FileSystemItem, Item, ItemType } from '@/types/ItemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useToastStore } from '@/stores/toast.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';

type DesktopItem = { id: number; type: ItemType; tileId: number; path?: string; };

export const useDesktopStore = defineStore('desktop', () => {
  const tileWidth = ref(85);
  const tileHeight = ref(85);
  const items = ref<(Item & { tileId: number })[]>([]);

  async function getDesktopDirectory(rayDb: RayDb) {
    const applicationItemsPath = `${useFileSystemStore().rootDirectory}/Desktop`;
    return await fileSystemLookup(rayDb, applicationItemsPath);
  }

  async function updateDesktopDirectory(rayDb: RayDb) {
    const fileItems = await rayDb.findAll<DesktopItem>('desktopFiles');
    if (fileItems.length === 0) {
      return;
    }

    const directory = await getDesktopDirectory(rayDb).then((directory) => {
      if (directory && !(directory instanceof Error)) {
        return { children: directory.children, id: directory.parent.id };
      }
    });

    if (!directory || !directory.children || !directory.id) {
      return;
    }

    for (const fileItem of fileItems) {
      const item = await rayDb.findOne<Item>('files', 'id', fileItem.id);

      if (!item) {
        return;
      }

      if (item.content.type === 'directory' && item.content.directory?.children) {
        await insertItemIntoFileSystem(rayDb, [directory.id], {
          directory: { name: item.content.directory.name, children: item.content.directory.children }
        });
      } else if (item.content.type === 'file') {
        await insertItemIntoFileSystem(rayDb, [directory.id], {
          file: { name: item.content.name, id: item.id, type: item.content.type }
        });
      } else if (item.content.type === 'application') {
        await insertItemIntoFileSystem(rayDb, [directory.id], {
          file: { name: item.label, id: item.id, type: item.content.type }
        });
      }
    }
  }

  async function initializeTileContent(rayDb: RayDb) {
    if (localStorage.getItem('desktopFilesInitialized') === 'initialized') {
      await updateTiles(rayDb);
      return;
    }

    const applicationFiles = (await rayDb.findAll<Item>('files')).filter(
      (file) => file.content.type === 'application',
    );

    for (const file of applicationFiles) {
      const index = applicationFiles.indexOf(file);
      await addDesktopItem(rayDb, { id: file.id, type: file.content.type, tileId: index + 1 });
    }

    localStorage.setItem('desktopFilesInitialized', 'initialized');
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
            } as Item & { tileId: number },
          ];
        }
      } else {
        const fileItem = await rayDb.findOne<Item>('files', 'id', item.id);
        if (fileItem) {
          items.value = [...items.value, { ...fileItem, tileId: item.tileId }];
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
      let item: Item & {tileId: number} | null = null;

      switch (desktopItem.type) {
        case 'file':
        case 'application':
          {
            item = await rayDb.findOne<Item & { tileId: number }>('files', 'id', desktopItem.id);
          }
          break;
        case 'directory': {
          const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', desktopItem.id);

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
    try {
      await rayDb.deleteOne('desktopFiles', tileId);
      items.value = items.value.filter((item) => item.tileId !== tileId);
    } catch (e) {
      throw (e as Error).message;
    }
  }

  async function getDesktopItems(rayDb: RayDb) {
    try {
      return await rayDb.findAll<DesktopItem>('desktopFiles');
    } catch (e) {
      throw (e as Error).message;
    }
  }

  async function getDesktopItemByTileId(rayDb: RayDb, tileId: number) {
    try {
      return await rayDb.findOne<DesktopItem>('desktopFiles', 'tileId', tileId);
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
    updateDesktopDirectory,
  };
});
