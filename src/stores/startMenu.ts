import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item, ItemType } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';

export const useStartMenuStore = defineStore('startMenu', () => {
  const showStartMenu = ref(false);
  const selectedTag = ref<ItemType>('application');
  const searchQuery = ref<string>('');

  async function fetchContentByTagAndSearchQuery(rayDb: RayDb, searchQuery: string) {
    const items = await rayDb.findAll<Item>('files').then((items) =>
      items.filter((item) => {
        if (selectedTag.value !== item.content.type) {
          return false;
        }

        if (searchQuery.length === 0) {
          return false;
        }

        if (!item.label.toLowerCase().startsWith(searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      }),
    );

    return items.map((item) => item.label);
  }

  function show() {
    showStartMenu.value = true;
  }

  function hide() {
    showStartMenu.value = false;
  }

  function isShown() {
    return showStartMenu.value;
  }

  return { isShown, show, hide, selectedTag, searchQuery, fetchContentByTagAndSearchQuery };
});
