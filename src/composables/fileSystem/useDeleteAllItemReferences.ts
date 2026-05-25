import type { RayDb } from 'ray-db-wrapper';
import { useDesktopStore } from '@/stores/desktop.ts';

export async function useDeleteAllItemReferences(
  rayDb: RayDb,
  fileId: number,
  fileSystemId: number
) {
  await rayDb.deleteOne('fileSystem', fileSystemId);
  await rayDb.deleteOne('files', fileId);
  await rayDb.deleteOne('desktopFiles', fileId);
  await useDesktopStore().updateTiles(rayDb);
}
