import type { FileSystemItem, FileType, Item } from '@/types/ItemTypes.ts';

export function useGetIsDisabledItem(
  fileSystemItem: FileSystemItem,
  currentItems: Item[],
  filterByFileType: FileType[],
) {
  if (!fileSystemItem.file || filterByFileType.length === 0) {
    return false;
  }

  const file = currentItems.find((file) => file.id === fileSystemItem.file?.id);
  if (file?.content.type === 'file') {
    return !filterByFileType.includes(file.content.rawFile?.type as FileType);
  }

  return true;
}
