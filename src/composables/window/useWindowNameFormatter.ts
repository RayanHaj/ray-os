import { type WindowName, windowNames } from '@/types/windowTypes.ts';

export function useWindowNameFormatter(windowName: string): WindowName | null {
  const formattedName = windowName[0].toLowerCase() + windowName.replace(' ', '').substring(1);
  if (windowNames.some((name) => name === formattedName)) return formattedName as WindowName;
  return null;
}
