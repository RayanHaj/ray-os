import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item, ItemType } from '@/types/ItemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';

type DesktopItem = { id: number; type: ItemType; path?: string[]; tileId: number };

export const useDesktopStore = defineStore('desktop', () => {
  const tileWidth = ref(85);
  const tileHeight = ref(85);
  const items = ref<(Item & { tileId: number })[]>([]);

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

    for (const item of desktopItems) {
      if (item.type === 'directory') {
      } else {
        const fileItem = await rayDb.findOne<Item>('files', 'id', item.id);
        if (fileItem) {
          items.value.push({ ...fileItem, tileId: item.tileId });
        }
      }
    }
  }

  async function updateDesktopItem(rayDb: RayDb, desktopItemId: number, newTileId: number) {
    try {
      const item = await rayDb.findOne<DesktopItem>('desktopFiles', 'id', desktopItemId);
      if (!item) {
        throw new Error('cannot find item');
      }

      item.tileId = newTileId;
      await rayDb.updateOne('desktopFiles', item);

      items.value = items.value.map((item) => {
        if (item.id === desktopItemId) {
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
      const item = await rayDb.findOne<Item & { tileId: number }>('files', 'id', desktopItem.id);
      if (!item) {
        throw new Error('Could not insert desktop item');
      }

      const itemId = await rayDb.insertOne<DesktopItem>('desktopFiles', desktopItem);
      if (!itemId) {
        throw new Error('Could not insert desktop item');
      }

      item.tileId = desktopItem.tileId;
      items.value = [...items.value, item];
    } catch (e) {
      throw (e as Error).message;
    }
  }

  async function deleteDesktopItem(rayDb: RayDb, desktopItemId: number) {
    try {
      await rayDb.deleteOne('desktopFiles', desktopItemId);
      items.value = items.value.filter((item) => item.id !== desktopItemId);
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
  };
});
