import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LineTerminal } from '@/types/terminalTypes.ts';

export const useTerminalStore = defineStore('terminal', () => {
  const FONT_SIZE_LS_KEY = 'terminalFontSize';
  const LS_COMMAND_CACHE_KEY = 'commandCache';

  const emptyLine = { line: '', isPlain: false };

  const cachedLines = ref<LineTerminal[]>([]);

  return { FONT_SIZE_LS_KEY, LS_COMMAND_CACHE_KEY, emptyLine, cachedLines };
});
