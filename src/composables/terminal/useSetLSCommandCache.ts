import type { LineTerminal } from '@/types/terminalTypes.ts';
import { useTerminalStore } from '@/stores/terminal.ts';

export const useSetLSCommandCache = async (): Promise<void> => {
  const terminalStore = useTerminalStore();

  const commandCacheLs = localStorage.getItem(terminalStore.LS_COMMAND_CACHE_KEY);
  if (commandCacheLs === null) {
    localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));
    return;
  }

  try {
    const parsedCommandCache = (await JSON.parse(commandCacheLs)) as LineTerminal[];

    if (parsedCommandCache.length === 0) return;
    terminalStore.cachedLines = parsedCommandCache;
  } catch (e) {
    console.error(e);
    localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));
  }
};
