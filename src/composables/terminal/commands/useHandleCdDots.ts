import type { Ref } from 'vue';

export function useHandleCdDots(currentPath: Ref<string[]>) {
  if (currentPath.value.length > 1) {
    currentPath.value.splice(currentPath.value.length-1);
  }
}
