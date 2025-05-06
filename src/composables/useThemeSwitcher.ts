export function useThemeSwitcher() {
  const getTheme = () => {
    return localStorage.getItem('theme') || '';
  };

  const setTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return { getTheme, setTheme };
}
