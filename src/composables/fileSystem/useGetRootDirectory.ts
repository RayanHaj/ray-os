import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem } from '@/types/itemTypes.ts';

export async function useGetRootDirectory(rayDb: RayDb, onlyId: true): Promise<number | undefined>;
export async function useGetRootDirectory(
  rayDb: RayDb,
  onlyId: false,
): Promise<FileSystemItem | undefined>;
export async function useGetRootDirectory(
  rayDb: RayDb,
  onlyId: boolean,
): Promise<FileSystemItem | number | undefined> {
  if (onlyId) {
    return (
      useFileSystemStore().ROOT_DIR_ID ??
      (await fetchRootDirectory(rayDb).then((value) => value?.id))
    );
  } else {
    return await fetchRootDirectory(rayDb);
  }
}

async function fetchRootDirectory(rayDb: RayDb) {
  const fileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');
  return fileSystemItems.find(
    (value) => value.directory?.name === useFileSystemStore().ROOT_DIR_NAME,
  );
}
