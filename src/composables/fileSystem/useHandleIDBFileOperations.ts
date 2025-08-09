import type { RayDb } from 'ray-db-wrapper';
import type { ItemType } from '@/types/ItemTypes.ts';
import { useDesktopStore } from '@/stores/desktop.ts';

export function useHandleIDBFileOperations(rayDb: RayDb) {
  async function remove(fileId: number, fileSystemId: number, type: ItemType) {
    await rayDb.deleteOne('fileSystem', fileSystemId);
    await rayDb.deleteOne('files', fileId);
    await rayDb.deleteOne('desktopFiles', [fileId, type]);
    await useDesktopStore().updateTiles(rayDb);
  }

  return { remove };
}
