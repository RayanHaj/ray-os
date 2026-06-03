import type { DataTransferDesktopItem, DesktopTileItem } from '@/types/desktopTypes.ts';
import type { FileSystemItem } from '@/types/itemTypes.ts';
import { useDesktopStore } from '@/stores/desktop.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useHandleDesktopTileDrop(
  event: DragEvent,
  desktopTileItem: DesktopTileItem | null,
  rayDb: RayDb,
) {
  if (desktopTileItem) return;

  const targetId = Number((event.currentTarget as HTMLElement).id);
  const _dataTransferData = event.dataTransfer?.getData('text/plain');

  if (!_dataTransferData) return;

  const parsedDataTransferData = JSON.parse(_dataTransferData);

  if ('directory' in parsedDataTransferData || 'file' in parsedDataTransferData) {
    await handleDropFileSystemItem(parsedDataTransferData as FileSystemItem, targetId, rayDb);
  } else if ('id' in parsedDataTransferData && 'type' in parsedDataTransferData) {
    await handleDropDesktopItem(parsedDataTransferData as DataTransferDesktopItem, targetId, rayDb);
  }
}

async function handleDropFileSystemItem(
  fileSystemItem: FileSystemItem,
  targetId: number,
  rayDb: RayDb,
) {
  const fileSystemItemId = getIdByFileSystemItem(fileSystemItem);
  if (!fileSystemItemId) return;

  await useDesktopStore().addDesktopItem(rayDb, {
    id: fileSystemItemId,
    tileId: targetId,
    type: fileSystemItem.type as 'application' | 'file' | 'directory',
    path: fileSystemItem.path,
  });
}

async function handleDropDesktopItem(
  dataTransferDesktopItem: DataTransferDesktopItem,
  targetId: number,
  rayDb: RayDb,
) {
  const { id: sourceId, type } = dataTransferDesktopItem;
  if (!sourceId || !type) return;

  const sourceItem = useDesktopStore().items.find(
    (item) => item.id === sourceId && item.content.type === type,
  );

  if (!sourceItem) return;

  await useDesktopStore().updateDesktopItem(rayDb, sourceItem.id, targetId, type);
}

function getIdByFileSystemItem(fileSystemItem: FileSystemItem) {
  switch (fileSystemItem.type) {
    case 'file':
    case 'application':
      return fileSystemItem.file?.id;
    case 'directory':
      return fileSystemItem.id;
    default:
      return fileSystemItem.id;
  }
}
