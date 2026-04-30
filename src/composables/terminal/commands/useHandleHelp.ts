import type { Ref } from 'vue';

const helpArray = [
  'cd   : change directory',
  'cd.. : move up one directory level',
  'cls  : clear the terminal screen',
  'help : list all available commands',
  'exit : close the terminal',
  'dir  : list the contents of the current directory',
  'mkdir: create a new directory',
  'del  : delete a file or folder',
  'start: open a file or application',
];

export function useHandleHelp(lines: Ref<Array<{ line: string; isPlain: boolean }>>) {
  lines.value.push({ line: helpArray.join('\n'), isPlain: true });
}
