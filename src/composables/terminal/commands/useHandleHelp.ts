import type { Ref } from 'vue';

const helpArray = [
  'dir  : list the contents of the current directory',
  'cd   : change directory',
  'cd.. : move up one directory level',
  'mkdir: create a new directory',
  'del  : delete a file or folder',
  'type : display the contents of a file',
  'echo : print text to the terminal',
  'cls  : clear the terminal screen',
  'help : list all available commands',
  'exit : close the terminal',
];

export function useHandleHelp(lines: Ref<Array<{ line: string; isPlain: boolean }>>) {
  lines.value.push({ line: helpArray.join('\n'), isPlain: true });
}
