import { useTaskbarStore } from '@/stores/taskbar.ts';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import type { FileSystemItem } from '@/types/itemTypes.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useAddOrRemoveFileFromTaskbar(
  rayDb: RayDb,
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  currentFileSystemItems: FileSystemItem[],
) {
  const taskbarStore = useTaskbarStore();
  const fileSystemItemId = multiSelect.getFirst();
  const fileSystemItem = currentFileSystemItems.find((item) => item.id === fileSystemItemId);

  if (!fileSystemItem || !fileSystemItem.file) return;

  await taskbarStore.addOrDeleteTaskbarItem(rayDb, fileSystemItem.file.id);
}
