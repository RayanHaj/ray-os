import type { FileSystemItem, InsertFileSystemItem } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useUpdateFileSystem } from '@/composables/fileSystem/useUpdateFileSystem.ts';
import { SystemFileDeleteError } from '@/exceptions/systemFileDeleteError.ts';
import type { DesktopTileItem } from '@/types/desktopTypes.ts';

export async function useDeleteFileSystemItem(
  rayDb: RayDb,
  fileSystemItemId: number,
  options?: {
    files?: { dontDeleteFromFilesStore?: boolean };
    directories?: { onlyDeleteParent?: boolean };
    updateFileSystem?: boolean;
  },
) {
  const parent: FileSystemItem = await rayDb.findOne<FileSystemItem>(
    'fileSystem',
    'id',
    fileSystemItemId,
  );
  if (!parent || !parent.id) return;

  if (parent.isSystemFile) throw new SystemFileDeleteError('cannot delete system files');

  await deleteChildReferencesOfParents();

  if (parent.file) {
    await useDeleteFileSystemItemFromIdbStores(rayDb, parent.id, {
      deleteFileReference: { fileId: parent.file.id },
      shallowDeletion: options?.files?.dontDeleteFromFilesStore ?? false,
    });
  } else if (parent.directory) {
    await useDeleteFileSystemItemFromIdbStores(rayDb, parent.id);
    if (options?.directories?.onlyDeleteParent) return;

    for (const child of parent.directory.children) {
      const fileSystemItem = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', child);
      if (!fileSystemItem.id) continue;

      await useDeleteFileSystemItemFromIdbStores(rayDb, fileSystemItem.id, {
        deleteFileReference: fileSystemItem.file ? { fileId: fileSystemItem.file.id } : undefined,
      });
    }
  }

  if (options?.updateFileSystem) await useUpdateFileSystem(rayDb);

  async function useDeleteFileSystemItemFromIdbStores(
    rayDb: RayDb,
    fileSystemId: number,
    options?: { deleteFileReference?: { fileId: number }; shallowDeletion?: boolean },
  ) {
    await rayDb.deleteOne('fileSystem', fileSystemId);

    const desktopItems = await rayDb.findAll<DesktopTileItem>('desktopFiles');
    const desktopItem = desktopItems.find(
      (item) => item.id === (options?.deleteFileReference?.fileId ?? fileSystemId),
    );

    if (desktopItem) {
      await rayDb.deleteOne('desktopFiles', desktopItem.tileId);
    }

    if (!options?.shallowDeletion) {
      await rayDb.deleteOne('files', options?.deleteFileReference?.fileId ?? fileSystemId);
    }
  }

  async function deleteChildReferencesOfParents() {
    for (const parentId of parent.parents) {
      const parent = await rayDb.findOne<FileSystemItem>('fileSystem', 'id', parentId);
      if (parent?.directory) {
        parent.directory.children = parent.directory.children.filter(
          (childId) => childId !== fileSystemItemId,
        );
        await rayDb.updateOne<InsertFileSystemItem>('fileSystem', parent);
      }
    }
  }
}
