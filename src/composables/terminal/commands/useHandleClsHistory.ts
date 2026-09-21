import { useTerminalStore } from '@/stores/terminal.ts';

export function useHandleClsHistory() {
  const terminalStore = useTerminalStore();

  localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));

  terminalStore.cachedLines = [];
}
