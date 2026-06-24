import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RayDb } from 'ray-db-wrapper';
import type { InsertTaskbarItem, TaskbarItem, TaskbarTileItem } from '@/types/taskbarTypes.ts';
import type { Item } from '@/types/itemTypes.ts';
import { useToastStore } from '@/stores/toast.ts';

export type TaskbarPosition = 'center' | 'left';
export const useTaskbarStore = defineStore('taskbar', () => {
  const taskbarHeight = ref(70);

  const tileHeight = ref(60);
  const tileWidth = ref(60);

  const taskbarPosition = ref<TaskbarPosition>('center');

  const items = ref<TaskbarTileItem[]>([]);

  async function initializeTileContent(rayDb: RayDb) {
    if (localStorage.getItem('taskbarFilesInitialized') === 'initialized') {
      await updateTiles(rayDb);
      return;
    }

    const applicationFiles = (await rayDb.findAll<Item>('files')).filter(
      (file) =>
        file.content.type === 'application' &&
        ['File Explorer', 'Terminal', 'Settings'].includes(file.label),
    );

    for (let i = 0; i < applicationFiles.length; i++) {
      await addOrDeleteTaskbarItem(rayDb, applicationFiles[i].id);
    }

    localStorage.setItem('taskbarFilesInitialized', 'initialized');
    await updateTiles(rayDb);
  }

  async function updateTiles(rayDb: RayDb) {
    const taskbarItems = await getTaskbarItems(rayDb);
    if (!taskbarItems) return;

    items.value = [];

    for (const item of taskbarItems) {
      const fileItem = await rayDb.findOne<Item>('files', 'id', item.applicationId);
      if (fileItem) {
        items.value = [...items.value, { ...fileItem, tileId: item.id }];
      }
    }
  }

  async function addOrDeleteTaskbarItem(rayDb: RayDb, applicationId: number) {
    try {
      const taskbarItems = await rayDb.findAll<TaskbarItem>('taskbarFiles');
      const alreadyOnTaskbar = taskbarItems.some((item) => item.applicationId === applicationId);

      if (alreadyOnTaskbar) {
        try {
          const taskbarItem = taskbarItems.find((item) => item.applicationId === applicationId);

          if (taskbarItem) {
            await rayDb.deleteOne('taskbarFiles', taskbarItem.id);
            items.value = items.value.filter((item) => item.id !== applicationId);
          }
        } catch (e) {
          console.error(e);
        }
        return;
      }

      const item: Item & { tileId: number } = await rayDb.findOne<Item & { tileId: number }>(
        'files',
        'id',
        applicationId,
      );

      if (!item || item.content.type !== 'application')
        throw new Error('Could not insert taskbar item');

      const itemId = await rayDb.insertOne<InsertTaskbarItem>('taskbarFiles', {
        applicationId: applicationId,
      });

      if (!itemId) throw new Error('Could not insert taskbar item');

      items.value = [...items.value, item];
    } catch (e) {
      if ((e as Error).name === 'ConstraintError') {
        useToastStore().createToast('file already added to the taskbar', 'error', 3000, 'desktop');
        return;
      }
      throw (e as Error).message;
    }
  }

  async function deleteTaskbarItem(rayDb: RayDb, tileId: number) {
    await rayDb.deleteOne('taskbarFiles', tileId);
    items.value = items.value.filter((item) => item.tileId !== tileId);
  }

  function setTaskbarPosition(position: TaskbarPosition) {
    localStorage.setItem('taskbarPosition', position);
    taskbarPosition.value = position;
  }

  const getTaskbarItems = async (rayDb: RayDb) => await rayDb.findAll<TaskbarItem>('taskbarFiles');

  return {
    taskbarHeight,
    tileHeight,
    tileWidth,
    taskbarPosition,
    getTaskbarItems,
    addOrDeleteTaskbarItem,
    deleteTaskbarItem,
    initializeTileContent,
    setTaskbarPosition,
    items,
  };
});
