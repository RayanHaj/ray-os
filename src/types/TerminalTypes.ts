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
] as const;
export type CommandKeyword = (typeof commands)[number];
