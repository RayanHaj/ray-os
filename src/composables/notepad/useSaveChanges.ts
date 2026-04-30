import type { FileSystemItem, InsertFileSystemItem, Item, ItemInsert } from '@/types/ItemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useToastStore } from '@/stores/toast.ts';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';

export async function useSaveChanges(
  rayDb: RayDb,
  headerFileName: string,
  windowId: string,
  loadedFile?: { windowId: string; fileId: number; fileName: string; text: string },
) {
  const toastStore = useToastStore();

  if (!loadedFile) {
    return;
  }

  const fileItem = await rayDb.findOne<Item>('files', 'id', loadedFile.fileId);
  if (!fileItem || fileItem.content.type !== 'file') {
    return;
  }

  try {
    const updatedText = loadedFile.text;
    const originalFileText = await fileItem.content.rawFile?.text();
    if (updatedText === originalFileText && headerFileName === fileItem.content.name) {
      toastStore.createToast('no changes made', 'warning', 3000, 'window', windowId);
    } else {
      let fileName = fileItem.content.name;

      if (headerFileName !== fileName) {
        const sanitizedFileName = useSanitizeFileName(headerFileName);
        if (useValidateFileName(sanitizedFileName, windowId)) {
          fileName = useSanitizeFileName(headerFileName);
        } else {
          return;
        }
      }

      fileItem.label = fileName;
      fileItem.content.name = fileName;
      fileItem.content.rawFile = new File([updatedText], fileName, { type: 'text/plain' });

      await rayDb.updateOne<ItemInsert>('files', fileItem);
      await rayDb.updateManyByQuery<InsertFileSystemItem>(
        'fileSystem',
        () => ({ file: { name: fileName } }),
        (item) => item.file?.id === fileItem.id,
      );
      useFileSystemStore().updateFileSystem();

      toastStore.createToast('saved changes', 'success', 2000, 'window', windowId);
    }
  } catch (e) {
    console.error(e);
    toastStore.createToast('could not save changes', 'error', 5000, 'window', windowId);
  }
}
