import { type CommandKeyword, commands } from '@/types/TerminalTypes.ts';
import type { Ref } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import type { RayDb } from 'ray-db-wrapper';
import {
  fileSystemLookup,
  getFileSystemItem,
  insertItemIntoFileSystem
} from '@/composables/useIndexedDbHelper.ts';

type CommandObject = { command: CommandKeyword; value: string };

export async function useHandleTerminalCommand(
  rayDb: RayDb,
  command: string,
  lines: Ref<Array<{ line: string; isPlain: boolean }>>,
  currentPath: Ref<string[]>,
  windowIdObject: { windowName: string; id: number },
) {
  const commandObject = parseCommandStringToArray(command);
  if (commandObject instanceof Error) {
    return commandObject;
  }

  const error = await handleCommand(rayDb, commandObject, lines, currentPath, windowIdObject);
  if (error) {
    return error;
  }

  return commandObject;
}

export function parseCommandStringToArray(command: string): CommandObject | Error {
  const commandArray = command.trim().replace(/\s+/g, ' ').split(' ');

  if (!commands.includes(commandArray[0] as CommandKeyword)) {
    return new Error(`'${command}' is not a valid command`);
  }

  return {
    command: commandArray[0] as CommandKeyword,
    value: command.replace(commandArray[0], '').trim(),
  };
}

const helpArray = [
  'dir:    list the contents of the current directory',
  'cd:     change directory',
  'cd..:   move up one directory level',
  'mkdir:  create a new directory',
  'del:    delete a file or folder',
  'type:   display the contents of a file',
  'echo:   print text to the terminal',
  'cls:    clear the terminal screen',
  'help:   list all available commands',
  'exit:   close the terminal',
];

async function handleCommand(
  rayDb: RayDb,
  commandObject: CommandObject,
  lines: Ref<Array<{ line: string; isPlain: boolean }>>,
  currentPath: Ref<string[]>,
  windowIdObject: { windowName: string; id: number },
) {
  let error: Error | null = null;
  switch (commandObject.command) {
    case 'cd':
      const hasError = await handleCd(rayDb, currentPath, commandObject.value);
      if (hasError) {
        error = hasError;
      }
      break;
    case 'cd..':
      await handleCdDots(currentPath);
      break;
    case 'cls':
      lines.value.splice(1);
      break;
    case 'help':
      lines.value.push({ line: helpArray.join('\n'), isPlain: true });
      break;
    case 'exit':
      useWindowStore().removeOpenWindowReference(windowIdObject.windowName, windowIdObject.id);
      break;
    case 'dir':
      await handleDir(rayDb, currentPath, lines);
      break;
    case 'mkdir':
      await handleMkdir(rayDb, currentPath, commandObject.value);
  }

  return error;
}

async function handleCd(rayDb: RayDb, currentPath: Ref<string[]>, value: string) {
  const copy = [...currentPath.value, value];
  const item = await fileSystemLookup(rayDb, copy.join('/'));
  if (!item || item instanceof Error) {
    return new Error(`no directory found with name '${value}'`);
  }

  currentPath.value = copy;
}

async function handleCdDots(currentPath: Ref<string[]>) {
  if (currentPath.value.length > 1) {
    currentPath.value.splice(currentPath.value.length-1);
  }
}

async function handleDir(rayDb: RayDb, currentPath: Ref<string[]>, lines: Ref<Array<{ line: string; isPlain: boolean }>>) {
  const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
  if (value instanceof Error || !value?.children) {
    return;
  }

  const childNameArray = [];
  let extension = '';
  for (const child of value.children) {
    const directory = child.directory;
    const file = child.file;

    if (directory) {
      childNameArray.push(directory.name);
      extension = 'directory';
    } else if (file) {
      childNameArray.push(file.name);
      extension = 'application';
    }
  }

  lines.value.push({ line: childNameArray.map(value => `[${value}]: ${extension}`).join('\n'), isPlain: true });
}

async function handleMkdir(rayDb: RayDb, currentPath: Ref<string[]>, name: string) {
  const value = await fileSystemLookup(rayDb, currentPath.value.join('/'));
  if (value instanceof Error || !value?.parent.id) {
    return;
  }

  await insertItemIntoFileSystem(rayDb, [value.parent.id], { directory: { name: name, children: [] } });
}
