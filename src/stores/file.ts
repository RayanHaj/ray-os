import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Item } from '@/types/ItemTypes.ts';
import { Applications } from '@/types/ItemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

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

    for (const applicationItem of applicationItems) {
      const containsApplicationItem = fileItems.some((item) => applicationItem.id === item.id);
      if (containsApplicationItem) break;

      const directoryContainsApplication = directory.children.some(
        (child) => child.id === applicationItem.id,
      );
      if (directoryContainsApplication) break;

      await rayDb.insertOne<Item>('files', applicationItem);
      await insertItemIntoFileSystem(rayDb, [directory.id], {
        file: {
          name: applicationItem.label,
          id: applicationItem.id,
          type: applicationItem.content.type,
        },
        isSystemFile: true,
      });
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
