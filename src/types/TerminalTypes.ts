export const commands = [
  'dir',
  'cd',
  'cd..',
  'mkdir',
  'del',
  'type',
  'echo',
  'cls',
  'help',
  'exit',
  'start'
] as const;
export type CommandKeyword = (typeof commands)[number];
export type LineTerminal = { line: string; isPlain: boolean };
