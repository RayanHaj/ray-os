import { useBrowserStore } from '@/stores/browser.ts';

export function useThemeSwitcher() {
  const getTheme = () => {
    return localStorage.getItem('theme') || '';
  };

  const setTheme = (theme: string) => {
    useBrowserStore().currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return { getTheme, setTheme };
}
