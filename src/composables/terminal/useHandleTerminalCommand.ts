import { type CommandKeyword, commands, type LineTerminal } from '@/types/TerminalTypes.ts';
import type { Ref } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useHandleCdDots } from '@/composables/terminal/commands/useHandleCdDots.ts';
import { useHandleCd } from '@/composables/terminal/commands/useHandleCd.ts';
import { useHandleCls } from '@/composables/terminal/commands/useHandleCls.ts';
import { useHandleHelp } from '@/composables/terminal/commands/useHandleHelp.ts';
import { useHandleExit } from '@/composables/terminal/commands/useHandleExit.ts';
import { useHandleDir } from '@/composables/terminal/commands/useHandleDir.ts';
import { useHandleMkdir } from '@/composables/terminal/commands/useHandleMkdir.ts';
import { useHandleDel } from '@/composables/terminal/commands/useHandleDel.ts';
import { useHandleStart } from '@/composables/terminal/commands/useHandleStart.ts';

type CommandObject = { command: CommandKeyword; value: string };

export async function useHandleTerminalCommand(
  rayDb: RayDb,
  command: string,
  lines: Ref<LineTerminal[]>,
  currentPath: Ref<string[]>,
  windowId: string,
) {
  const commandObject = parseCommandStringToArray(command);
  if (commandObject instanceof Error) {
    return commandObject;
  }

  const error = await handleCommand(rayDb, commandObject, lines, currentPath, windowId);
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

async function handleCommand(
  rayDb: RayDb,
  commandObject: CommandObject,
  lines: Ref<LineTerminal[]>,
  currentPath: Ref<string[]>,
  windowId: string,
) {
  let commandError: Error | null = null;
  switch (commandObject.command) {
    case 'cd':
      commandError = (await useHandleCd(rayDb, currentPath, commandObject.value)) ?? null;
      break;
    case 'cd..':
      useHandleCdDots(currentPath);
      break;
    case 'cls':
      useHandleCls(lines);
      break;
    case 'help':
      useHandleHelp(lines);
      break;
    case 'exit':
      useHandleExit(windowId);
      break;
    case 'dir':
      await useHandleDir(rayDb, currentPath, lines);
      break;
    case 'mkdir':
      commandError = (await useHandleMkdir(rayDb, lines, currentPath, commandObject.value)) ?? null;
      break;
    case 'del':
      commandError = (await useHandleDel(rayDb, lines, currentPath, commandObject.value)) ?? null;
      break;
    case 'start':
      await useHandleStart(rayDb, lines, currentPath, commandObject.value);
  }

  return commandError;
}
