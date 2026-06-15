import { readonly, shallowRef, triggerRef } from 'vue';

export function useMultiSelect<T>(initSet?: T[]) {
  const set = shallowRef<Set<T>>(new Set<T>(initSet));

  function isSelected(value: T): boolean {
    return set.value.has(value);
  }

  function toggle(value: T) {
    const returnVal: { value: T; event: 'deleted' | 'added' } = { value: value, event: 'added' };

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

  function add(value: T) {
    if (set.value.has(value)) {
      return;
    }

    set.value.add(value);
    triggerRef(set);
  }

  function getFirst() {
    const [firstEl] = set.value;
    return firstEl;
  }

  function getLast() {
    const lastValue = [...set.value].pop();
    return lastValue ?? null;
  }

  function size() {
    return set.value.size;
  }

  function clear() {
    set.value.clear();
    triggerRef(set);
  }

  async function forEachSelected(func: (value: T) => Promise<void>) {
    for (const value of set.value) {
      await func(value);
    }
  }

  return {
    selectedItems: readonly(set),
    getFirst,
    getLast,
    isSelected,
    toggle,
    add,
    size,
    clear,
    forEachSelected,
  };
}
