import { readonly, shallowRef, triggerRef } from 'vue';

export function useMultiSelect<T>(initSet?: T[]) {
  const set = shallowRef<Set<T>>(new Set<T>(initSet));

  function isSelected(value: T): boolean {
    return set.value.has(value);
  }

  function toggle(value: T) {
    const returnVal: {
      value: T,
      event: 'deleted' | 'added'
    } = {
      value: value,
      event: 'added'
    };

    if (set.value.has(value)) {
      set.value.delete(value);
      returnVal.event = 'deleted';
    } else {
      set.value.add(value);
      returnVal.event = 'added';
    }

    triggerRef(set);
    return returnVal;
  }

  function getFirst() {
    const [firstEl] = set.value;
    return firstEl;
  }

  function forEachSelected(func: (value: T) => void) {
    for (const value of set.value) {
      func(value);
    }
  }

  function clear() {
    set.value.clear();
    triggerRef(set);
  }

  return {
    selectedItems: readonly(set),
    getFirst,
    isSelected,
    toggle,
    clear,
    forEachSelected
  }
}
