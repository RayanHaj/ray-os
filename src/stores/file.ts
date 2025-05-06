import { markRaw, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Item } from '@/types/Item.ts';
import type { Component } from 'vue';
import initItems from '@/json/initTiles.json';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

export const useFileStore = defineStore('file', () => {
  const files = ref<Item[]>([]);
  const fileSvgs = ref<{ [svg: string]: Component }>({});

  async function initializeFiles() {
    files.value = setInitialValues().sort((a, b) => a.content?.id - b.content?.id);

    for (const file of files.value) {
      const svgComponent = await useSvgByFileNameAndDirectory('applications', file.label);
      if (!svgComponent) {
        continue;
      }

      fileSvgs.value[file.label] = markRaw(svgComponent);
    }
  }

  function setInitialValues() {
    return initItems.reduce((accumulator, value) => {
      if (value.content.type !== 'application') return accumulator;

      const item: Item = {
        label: value.label,
        content: {
          id: value.content.id,
          type: value.content.type,
        },
      };

      accumulator.push(item);
      return accumulator;
    }, [] as Item[]);
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
