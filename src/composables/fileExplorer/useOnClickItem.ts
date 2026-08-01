import { useBrowserStore } from '@/stores/browser.ts';
import type { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import type { FileSystemItem } from '@/types/itemTypes.ts';

export function useOnClickItem(
  event: MouseEvent,
  currentFileSystemItems: FileSystemItem[],
  fileSystemItem: FileSystemItem,
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  multiSelectActivated: boolean,
  isInFileSelectState: boolean,
) {
  if ((useBrowserStore().isMobile || !event.ctrlKey) && multiSelectActivated) {
    if (event.shiftKey) {
      const lastSelectedElement = multiSelect.getLast();
      if (lastSelectedElement) {
        const oldSelectedItem = currentFileSystemItems.findIndex(
          (item) => item.id === lastSelectedElement,
        );
        const newSelectedItem = currentFileSystemItems.findIndex(
          (item) => item.id === fileSystemItem.id,
        );

        if (oldSelectedItem !== -1 && newSelectedItem !== -1) {
          if (newSelectedItem > oldSelectedItem) {
            for (let i = oldSelectedItem + 1; i <= newSelectedItem; i++) {
              multiSelect.add(currentFileSystemItems[i].id);
            }
          } else {
            for (let i = oldSelectedItem - 1; i >= newSelectedItem; i--) {
              multiSelect.add(currentFileSystemItems[i].id);
            }
          }
          return;
        }
      }
    }
    if (
      multiSelect.selectedItems.value.size === 1 &&
      multiSelect.selectedItems.value.has(fileSystemItem.id)
    ) return;

    if (!isInFileSelectState) multiSelect.clear();
  }

  if (!multiSelectActivated) multiSelect.clear();

  multiSelect.toggle(fileSystemItem.id);
}
