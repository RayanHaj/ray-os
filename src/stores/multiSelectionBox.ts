import { defineStore } from 'pinia';
import { reactive, type Ref, ref } from 'vue';

export const useMultiSelectionBoxStore = defineStore('multiSelectionBox', <T>() => {
  const multiSelectionVariables = reactive({
    isSelecting: false,
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
    left: 0,
    top: 0,
  });

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

  return { multiSelectionVariables, selectItem, selectItems, unSelectItem, unSelectAllItems, getItem, getAllItems }
});
