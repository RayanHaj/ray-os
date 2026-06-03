import type { Ref } from 'vue';
import type { LineTerminal } from '@/types/terminalTypes.ts';

export function useHandleCls(lines: Ref<LineTerminal[]>) {
  lines.value.splice(1);
}
