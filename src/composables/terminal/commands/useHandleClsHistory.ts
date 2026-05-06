import type { Ref } from 'vue';
import type { LineTerminal } from '@/types/TerminalTypes.ts';

export function useHandleClsHistory(lsClsCommandKey: string, cachedLines: Ref<LineTerminal[]>) {
  localStorage.setItem(lsClsCommandKey, JSON.stringify([]));
  cachedLines.value = [];
}
