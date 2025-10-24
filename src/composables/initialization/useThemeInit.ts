import { useThemeSwitcher } from '@/composables/helpers/useThemeSwitcher.ts';
import themes from '@/json/themes.json';

export function useThemeInit() {
  const theme = useThemeSwitcher().getTheme();
  if (theme === '') {
    useThemeSwitcher().setTheme(Object.keys(themes)[0]);
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
