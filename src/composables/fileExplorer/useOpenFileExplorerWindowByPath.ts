import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useParseToPathArray } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useWindowStore } from '@/stores/window.ts';

export function useOpenFileExplorerWindowByPath(path: string) {
  const nextWindowId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFilePathAtWindow(nextWindowId, useParseToPathArray(path));
  return useWindowStore().pushOpenWindowReference('File Explorer');
}
