import { type WindowName, windowNames } from '@/types/WindowTypes.ts';

export function useWindowNameFormatter(windowName: string): WindowName | undefined {
  const formattedName = windowName[0].toLowerCase() + windowName.replace(' ', '').substring(1);
  if (!windowNames.some((name) => name === formattedName)) {
    return undefined;
  }

  return formattedName as WindowName;
}
