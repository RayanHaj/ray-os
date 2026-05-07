import type { Ref } from 'vue';
import type { LineTerminal } from '@/types/TerminalTypes.ts';

const helpArray = [
  'cd          : change directory',
  'cd..        : move up one directory level',
  'cls         : clear the terminal screen',
  'cls-history : clear the command history',
  'help        : list all available commands',
  'exit        : close the terminal',
  'dir         : list the contents of the current directory',
  'mkdir       : create a new directory',
  'del         : delete a file or folder',
  'start       : open a file or application',
  '',
  'Tip: ctrl + scroll or pinch to zoom to adjust font size',
];

export function useHandleHelp(lines: Ref<LineTerminal[]>) {
  lines.value.push({ line: helpArray.join('\n'), isPlain: true });
}
