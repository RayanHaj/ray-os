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
  'start',
  'cls-history',
] as const;
export type CommandKeyword = (typeof commands)[number];
export type LineTerminal = { line: string; isPlain: boolean };

export const createInitialLineTerminal = (): LineTerminal => ({
  line: 'RayOS Terminal — type "help" for commands',
  isPlain: true,
});

export const createEmptyLineTerminal = (): LineTerminal => ({ line: '', isPlain: false });
