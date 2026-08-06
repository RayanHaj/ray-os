import { useThemeSwitcher } from '@/composables/helpers/useThemeSwitcher.ts';
import { themes } from '@/types/themeTypes.ts';

export function useThemeInit() {
  const theme = useThemeSwitcher().getTheme();
  if (theme === '') {
    useThemeSwitcher().setTheme(themes[0]);
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
