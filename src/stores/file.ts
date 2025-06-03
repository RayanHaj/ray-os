import { markRaw, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Item } from '@/types/Item.ts';
import type { Component } from 'vue';
import initItems from '@/json/initTiles.json';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { ApplicationItem } from '@/types/ApplicationItem.ts';
import type { RayDb } from 'ray-db-wrapper';
import {
  fileSystemLookup,
  insertItemIntoFileSystem
} from '@/composables/useIndexedDbHelper.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export const useFileStore = defineStore('file', () => {
  const files = ref<Item[]>([]);
  const fileSvgs = ref<{ [svg: string]: Component }>({});

  async function initializeFiles(rayDb: RayDb) {
    files.value = await setInitialValues(rayDb)
      .then(value => value.sort((a, b) => a.content?.id - b.content?.id));

    for (const file of files.value) {
      const svgComponent = await useSvgByFileNameAndDirectory('applications', file.label);
      if (!svgComponent) {
        continue;
      }

      fileSvgs.value[file.label] = markRaw(svgComponent);
    }
  }

  async function setInitialValues(rayDb: RayDb) {
    const itemArray = [];
    const allItems = await rayDb.findAll<Item>('files');
    for (const item of initItems) {
      if (item.content.type !== 'application') return [];

      const objectItem: Item = {
        label: item.label,
        content: { ...item.content as ApplicationItem }
      }

      if (allItems.some(item => item.label === objectItem.label && item.content.id === objectItem.content.id)) {
        itemArray.push(objectItem);
      } else {
        await rayDb.insertOne<Item>('files', objectItem);
        const parentId = await fileSystemLookup(rayDb, `${useFileSystemStore().rootDirectory}/Applications`)
          .then(value => value?.parent.id);

        if (parentId) {
          await insertItemIntoFileSystem(rayDb, [parentId], {
            file: { name: objectItem.label, id: objectItem.content.id }
          });
        }
        itemArray.push(objectItem);
      }
    }

    return itemArray;
  }

  async function addItem(item: Item) {
    files.value.push(item);
    if (item.content.type === 'application') {
      await useSvgByFileNameAndDirectory('applications', item.label).then((svg) => {
        if (!svg) {
          return;
        }

        fileSvgs.value[item.label] = markRaw(svg);
      });
    }
  }

  function getSvgByName(name: string) {
    return fileSvgs.value[name];
  }

  return { initializeFiles, getSvgByName, files, fileSvgs };
});
