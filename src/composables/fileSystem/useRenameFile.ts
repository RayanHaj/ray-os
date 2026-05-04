import type { FileType, InsertFileSystemItem, Item, ItemInsert } from '@/types/ItemTypes.ts';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useDesktopStore } from '@/stores/desktop.ts';

export async function useRenameFile(rayDb: RayDb, fileItem: Item, newFileName: string, windowId: string) {
  if (fileItem.content.type !== 'file') return;

  const sanitizedFileName = useSanitizeFileName(
    newFileName,
    fileItem.content.rawFile?.type as FileType,
  );

  if (!useValidateFileName(sanitizedFileName, windowId)) {
    return;
  }

  fileItem.label = sanitizedFileName;
  fileItem.content.name = sanitizedFileName;

  await rayDb.updateOne<ItemInsert>('files', fileItem);
  await rayDb.updateManyByQuery<InsertFileSystemItem>(
    'fileSystem',
    () => ({ file: { name: sanitizedFileName } }),
    (item) => item.file?.id === fileItem.id,
  );

  await useDesktopStore().updateTiles(rayDb);
  useFileSystemStore().updateFileSystem();
}
