import { useTerminalStore } from '@/stores/terminal.ts';

export const useGetLSTerminalFontSize = (): number | null => {
  const terminalStore = useTerminalStore();
  const fontSizeLS = localStorage.getItem(terminalStore.FONT_SIZE_LS_KEY);

  if (!fontSizeLS) return null;

  return Number(fontSizeLS);
}
