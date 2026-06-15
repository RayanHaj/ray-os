import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import type { FileSystemItem, Item } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';

export async function useOnDblClickItemInFileSelectState(
  rayDb: RayDb,
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  windowId: string,
) {
  const foundSelectState = useFileExplorerStore().fileSelectState.find(
    (element) => element.fileExplorerWindowId === windowId,
  );

  if (!foundSelectState?.targetWindowId) return;

  const selectedFilesList: FileSelectReturnItem[] = [];
  await multiSelect.forEachSelected(async (value) => {
    const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', value);
    if (!fileSystemItem || !fileSystemItem.file) return;

    const fileItem = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
    if (!fileItem || fileItem.content.type !== 'file') return;

    selectedFilesList.push({
      fileSystemItemId: fileSystemItem.id,
      fileId: fileItem.id,
      fileItem: fileItem.content,
    });
    return;
  });

  useFileExplorerStore().fileSelectReturnValue = [
    ...useFileExplorerStore().fileSelectReturnValue,
    { windowId: foundSelectState.targetWindowId, value: selectedFilesList },
  ];

  multiSelect.clear();
}
