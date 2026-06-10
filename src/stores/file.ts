import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Item } from '@/types/itemTypes.ts';
import { Applications } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';

export const useFileStore = defineStore('file', () => {
  const applications = ref<Item[]>([]);

  async function initializeFiles(rayDb: RayDb) {
    const applicationItems = mapApplicationsToItems();
    await insertApplicationItemsIntoIndexedDb(rayDb, applicationItems);
    applications.value = applicationItems;
  }

  async function insertApplicationItemsIntoIndexedDb(rayDb: RayDb, applicationItems: Item[]) {
    const fileItems = await rayDb.findAll<Item>('files');

    const directory = await getApplicationDirectory(rayDb).then((directory) => {
      if (directory && !(directory instanceof Error)) {
        return { children: directory.children, id: directory.parent.id };
      }
    });

    if (!directory || !directory.children || !directory.id) return;

    for (let i = 0; i < applicationItems.length; i++) {
      const containsApplicationItem = fileItems.some(
        (item) => item.content.type === 'application' && item.label === applicationItems[i].label,
      );
      if (!containsApplicationItem) {
        const id = await rayDb.insertOne<Item>('files', applicationItems[i]);
        if (typeof id === 'number') {
          applicationItems[i] = { ...applicationItems[i], id: id };
        }
      }

      const directoryContainsApplication = directory.children.some(
        (child) => child.file?.id === applicationItems[i].id,
      );

      if (!directoryContainsApplication) {
        await useInsertFileSystemItem(rayDb, [directory.id], {
          file: {
            name: applicationItems[i].label,
            id: applicationItems[i].id,
            type: applicationItems[i].content.type,
          },
          isSystemFile: true,
        });
      }
    }
  }

  async function getApplicationDirectory(rayDb: RayDb) {
    const applicationItemsPath = `${useFileSystemStore().ROOT_DIR_NAME}/Applications`;
    return await fileSystemLookup(rayDb, applicationItemsPath);
  }

  function mapApplicationsToItems(): Item[] {
    return Applications.map((application, index) => {
      const item: Item = { label: application, content: { type: 'application' }, id: index + 1 };
      return item;
    });
  }

  return { initializeFiles, applications };
});
