import type { RayDb } from 'ray-db-wrapper';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

export async function useUpdateFileSystem(rayDb: RayDb) {
  await useDesktopStore().updateTiles(rayDb);
  useFileSystemStore().updateFileSystem();
}
