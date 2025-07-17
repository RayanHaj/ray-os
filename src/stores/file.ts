import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ApplicationItem, Item } from '@/types/ItemTypes.ts';
import initItems from '@/json/initTiles.json';
import type { RayDb } from 'ray-db-wrapper';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export const useFileStore = defineStore('file', () => {
  const files = ref<Item[]>([]);

  async function initializeFiles(rayDb: RayDb) {
    files.value = await setInitialValues(rayDb).then((value) =>
      value.sort((a, b) => a.content.id - b.content.id),
    );
  }

  async function setInitialValues(rayDb: RayDb) {
    const itemArray = [];
    const allItems = await rayDb.findAll<Item>('files');
    for (const item of initItems) {
      if (item.content.type !== 'application') return [];

      const objectItem: Item = {
        label: item.label,
        content: { ...(item.content as ApplicationItem) },
      };

      if (
        allItems.some(
          (item) => item.label === objectItem.label && item.content.id === objectItem.content.id,
        )
      ) {
        itemArray.push(objectItem);
      } else {
        await rayDb.insertOne<Item>('files', objectItem);
        const parentId = await fileSystemLookup(
          rayDb,
          `${useFileSystemStore().rootDirectory}/Applications`,
        ).then((value) => value?.parent.id);

        if (parentId) {
          await insertItemIntoFileSystem(rayDb, [parentId], {
            file: { name: objectItem.label, id: objectItem.content.id },
          });
        }
        itemArray.push(objectItem);
      }
    }

    return itemArray;
  }

  return { initializeFiles, files };
});
