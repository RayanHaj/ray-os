import type { FileType, Item } from '@/types/itemTypes.ts';

export function useGetIsDisabledItem(currentFileItem: Item | null, filterByFileType: FileType[]) {
  if (filterByFileType.length === 0 || currentFileItem === null) return false;

  if (currentFileItem?.content.type === 'file') {
    console.log(currentFileItem.content.rawFile?.type);
    return !filterByFileType.includes(currentFileItem.content.rawFile?.type as FileType);
  }

  return true;
}
