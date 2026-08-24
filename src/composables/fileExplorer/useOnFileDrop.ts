import {
  fileExtensions,
  type FileItem,
  type FileSystemItem,
  type ItemInsert,
} from '@/types/itemTypes.ts';
import { useInsertFileSystemItem } from '@/composables/fileSystem/useInsertFileSystemItem.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';
import { useToastStore } from '@/stores/toast.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';

export async function useOnFileDrop(
  event: DragEvent,
  rayDb: RayDb,
  currentFileSystemItems: FileSystemItem[],
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  parentId: number,
) {
  const targetElement = (event.target as Element).closest('div');
  if (targetElement?.className === 'item') {
    try {
      await multiSelect.forEachSelected(async (id) => {
        const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', id);

        if (!fileSystemItem) return;

        const targetElementName = targetElement.innerText;
        const targetElementId = currentFileSystemItems.find(
          (dirEl) => dirEl.directory?.name == targetElementName,
        )?.id;

        if (targetElementId === undefined) return;
        if (targetElementId === fileSystemItem.id) return;

        await useInsertFileSystemItem(rayDb, [targetElementId], fileSystemItem);
        await useDeleteFileSystemItem(rayDb, fileSystemItem.id, {
          files: { dontDeleteFromFilesStore: true },
          directories: { onlyDeleteParent: true },
          updateFileSystem: true,
        });
      });

      // const plainItem = event.dataTransfer?.getData('text/plain');
      // if (!plainItem) return;
      //
      // const parsedItem = JSON.parse(plainItem);
      // if (typeof parsedItem !== 'object') return;
      //
      // const dropItem = parsedItem as FileSystemItem;
      // if (dropItem.isSystemFile) return;
      //
      // const targetElementName = targetElement.innerText;
      // const targetElementId = currentFileSystemItems.find(
      //   (dirEl) => dirEl.directory?.name == targetElementName,
      // )?.id;
      //
      // if (targetElementId === undefined) {
      //   return;
      // }
      //
      // if (targetElementId === dropItem.id) {
      //   return;
      // }
      //
      // await useInsertFileSystemItem(rayDb, [targetElementId], dropItem);
      // await useDeleteFileSystemItem(rayDb, dropItem.id, {
      //   files: { dontDeleteFromFilesStore: true },
      //   directories: { onlyDeleteParent: true },
      //   updateFileSystem: true,
      // });
    } catch (e) {
      console.error(e);
    }

    return;
  }

  const file = event.dataTransfer?.files[0];
  if (!file) {
    return;
  }

  if (!Object.keys(fileExtensions).includes(file.type)) {
    return;
  }

  const fileObject: FileItem = {
    type: 'file',
    name: file.name,
    size: file.size,
    createdAt: file.lastModified.toString(),
    rawFile: file,
  };

  if (parentId === -1) {
    return;
  }

  try {
    const fileId = await rayDb.insertOne<ItemInsert>('files', {
      label: file.name,
      content: fileObject as FileItem,
    });
    if (fileId && typeof fileId === 'number') {
      await useInsertFileSystemItem(rayDb, [parentId], {
        file: { name: file.name, id: fileId, type: file.type },
      });
    }
  } catch (e) {
    useToastStore().createToast((e as Error).message, 'error', 5000, 'desktop');
  }
}
