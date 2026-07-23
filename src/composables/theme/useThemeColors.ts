import type { Theme, ThemeProperty } from '@/types/themeTypes.ts';

export function useThemeColors() {
  const getThemeColor = (themeName: Theme, themeProperty: ThemeProperty) => {
    const el = document.createElement('div');
    el.setAttribute('data-theme', themeName);

    el.style.position = 'absolute';
    el.style.opacity = '0';
    el.style.left = '-9999px';

    document.body.appendChild(el);

    const value = getComputedStyle(el).getPropertyValue(themeProperty);
    document.body.removeChild(el);

    return value.trim();
  }

  return { getThemeColor }
}
