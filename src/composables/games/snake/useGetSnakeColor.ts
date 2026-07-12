import { ref, watch } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';

export function useGetSnakeColor() {
  const browserStore = useBrowserStore();
  const snakeColor = ref<string>();
  watch(
    () => browserStore.currentTheme,
    () => {
      snakeColor.value = getComputedStyle(document.documentElement).getPropertyValue(
        '--accent-color',
      );
    },
    { immediate: true },
  );

  return { snakeColor };
}
