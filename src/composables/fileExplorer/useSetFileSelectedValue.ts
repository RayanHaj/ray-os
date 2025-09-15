import type { FileItem } from '@/types/ItemTypes.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

export function useSetFileSelectedValue(windowId: string, fileId: number, fileContent: FileItem) {
  useFileExplorerStore().isInFileSelectStateReturnValue = {
    windowId: windowId,
    fileId: fileId,
    value: fileContent,
  };
}
