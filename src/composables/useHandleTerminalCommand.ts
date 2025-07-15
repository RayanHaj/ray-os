import { type CommandKeyword, commands } from '@/types/TerminalTypes.ts';
import type { Ref } from 'vue';
import { useWindowStore } from '@/stores/window.ts';

type CommandObject = {command: CommandKeyword, value: string};
export function useHandleTerminalCommand(command: string, commandsArray: Ref<string[]>, windowIdObject: {
  windowName: string;
  id: number;
}) {
  const commandObject = parseCommandStringToArray(command);
  if (commandObject instanceof Error) {
    return;
  }

  handleCommand(commandObject, commandsArray, windowIdObject);
  return commandObject;
}

export function parseCommandStringToArray(command: string): CommandObject | Error {
  const commandArray = command.trim().replace(/\s+/g, ' ').split(' ');

  if (!commands.includes(commandArray[0] as CommandKeyword)) {
    return new Error('error');
  }

  return {
    command: commandArray[0] as CommandKeyword,
    value: command.replace(commandArray[0], '').trim()
  };
}

const helpArray = [
  'dir: list the contents of the current directory',
  'cd: change directory',
  'cd..: move up one directory level',
  'mkdir: create a new directory',
  'del: delete a file or folder',
  'type: display the contents of a file',
  'echo: print text to the terminal',
  'cls: clear the terminal screen',
  'help: list all available commands',
  'exit: close the terminal'
];

function handleCommand(commandObject: CommandObject, commandsArray: Ref<string[]>, windowIdObject: {
  windowName: string;
  id: number;
}) {
  switch (commandObject.command) {
    case 'cd':
      handleCd();
      break;
    case 'cd..':
      handleCdDots();
      break;
    case 'cls':
      commandsArray.value.splice(1);
      break;
    case 'help':
      commandsArray.value.push(helpArray.join('\n'));
      break;
    case 'exit':
      useWindowStore().removeOpenWindowReference(windowIdObject.windowName, windowIdObject.id);
  }
}

function handleCd() {
  console.log('handleCd')
}

function handleCdDots() {
  console.log('handleCdDots')
}
