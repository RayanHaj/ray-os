import { useBrowserStore } from '@/stores/browser.ts';
import type { Theme } from '@/types/themeTypes.ts';

export function useThemeSwitcher() {
  const getTheme = () => {
    return localStorage.getItem('theme') || '';
  };

  const setTheme = (theme: Theme) => {
    useBrowserStore().currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return { getTheme, setTheme };
}
