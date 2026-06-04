import type { FileSystemItem, InsertFileSystemItem } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useUpdateFileSystem } from '@/composables/fileSystem/useUpdateFileSystem.ts';
import { SystemFileDeleteError } from '@/exceptions/systemFileDeleteError.ts';
import type { DesktopTileItem } from '@/types/desktopTypes.ts';

export async function useDeleteFileSystemItem(
  rayDb: RayDb,
  itemIdentifier: FileSystemItem | number,
  options?: {
    files?: { dontDeleteFromFilesStore?: boolean };
    directories?: { onlyDeleteParent?: boolean };
    updateFileSystem?: boolean;
  },
) {
  if (typeof itemIdentifier === 'number') {
    await deleteFileSystemItem(itemIdentifier);
  } else {
    await deleteFileSystemItem(itemIdentifier.id);
  }

  if (options?.updateFileSystem) await useUpdateFileSystem(rayDb);

  async function deleteFileSystemItem(id: number) {
    const parent: FileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', id);
    if (!parent || !parent.id) {
      return;
    }

    if (parent.isSystemFile) {
      throw new SystemFileDeleteError('cannot delete system files');
    }

    for (const parentId of parent.parents) {
      const parent = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', parentId);
      if (parent?.directory) {
        parent.directory.children = parent.directory.children.filter((childId) => childId !== id);
        await rayDb.updateOne<InsertFileSystemItem>('fileSystem', parent);
      }
    }

    if (parent.file) {
      if (options?.files?.dontDeleteFromFilesStore) {
        await useDeleteFileSystemItemFromIdbStores(rayDb, parent.id, { shallowDeletion: true });
      } else {
        await useDeleteFileSystemItemFromIdbStores(rayDb, parent.id, {
          deleteFileReferences: { fileId: parent.file.id },
          shallowDeletion: false,
        });
      }
    } else if (parent.directory) {
      await useDeleteFileSystemItemFromIdbStores(rayDb, parent.id, { shallowDeletion: false });

      if (options?.directories?.onlyDeleteParent) return;

      for (const child of parent.directory.children) {
        const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);
        if (!fileSystemItem.id) {
          continue;
        }

        if (fileSystemItem.file) {
          await useDeleteFileSystemItemFromIdbStores(rayDb, fileSystemItem.id, {
            deleteFileReferences: { fileId: fileSystemItem.file.id },
            shallowDeletion: false,
          });
        } else if (fileSystemItem.directory) {
          await useDeleteFileSystemItemFromIdbStores(rayDb, fileSystemItem.id, {
            shallowDeletion: false,
          });
        }
      }
    }
  }

  async function useDeleteFileSystemItemFromIdbStores(
    rayDb: RayDb,
    fileSystemId: number,
    options?: { deleteFileReferences?: { fileId: number }; shallowDeletion?: boolean },
  ) {
    await rayDb.deleteOne('fileSystem', fileSystemId);

    const desktopItems = await rayDb.findAll<DesktopTileItem>('desktopFiles');
    if (options?.deleteFileReferences?.fileId) {
      const desktopItem = desktopItems.find(
        (item) => item.id === options.deleteFileReferences!.fileId,
      );
      if (desktopItem) {
        await rayDb.deleteOne('desktopFiles', desktopItem.tileId);
      }
    } else {
      const desktopItem = desktopItems.find((item) => item.id === fileSystemId);
      if (desktopItem) {
        await rayDb.deleteOne('desktopFiles', desktopItem.tileId);
      }
    }

    if (!options?.shallowDeletion) {
      await rayDb.deleteOne('files', options?.deleteFileReferences?.fileId ?? fileSystemId);
    }
  }
}
