import { defineStore } from 'pinia';
import { type Ref, ref } from 'vue';

export const useMultiSelectionBoxStore = defineStore('multiSelectionBox', <T>() => {
  const selectedItems: Ref<T[]> = ref([]);

  function selectItem(item: T): void {
    selectedItems.value = [...selectedItems.value, item];
  }

  function selectItems(items: T[]): void {
    selectedItems.value = [...selectedItems.value, ...items];
  }

  function unSelectItem(item: T): void {
    selectedItems.value = selectedItems.value.filter((it) => it !== item);
  }

  function unSelectAllItems(): void {
    selectedItems.value = [];
  }

  function getItem(item: T): T | null {
    return selectedItems.value.find(it => it === item) ?? null;
  }

  function getAllItems(): T[] {
    return selectedItems.value;
  }

  return { selectItem, selectItems, unSelectItem, unSelectAllItems, getItem, getAllItems }
});
