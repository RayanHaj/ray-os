import {
  type FileItem,
  type FileSystemItem,
  type Item,
} from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useOpenWindowByFileItem } from '@/composables/window/useOpenWindowByFileItem.ts';

export async function useHandleExplorerFileClicked(
  item: FileSystemItem & { type: string },
  currentParentItemId: Ref<number | undefined>,
  rayDb: RayDb,
  windowId: string,
) {
  if (!item.file) return;

  switch (item.type) {
    case 'application':
      handleApplicationClicked();
      break;
    case 'file':
      await handleFileClicked();
      break;
  }

  currentParentItemId.value = item.id;

  function handleApplicationClicked() {
    if (!item.file) return;

    useWindowStore().pushOpenWindowReference(item.file.name);
  }

  async function handleFileClicked() {
    if (!item.file) return;

    const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
    if (!file) return;

    if (file.content.type === 'file') {
      const foundSelectState = useFileExplorerStore().fileSelectState.find(
        (element) => element.fileExplorerWindowId === windowId,
      );

      if (foundSelectState?.active) {
        useFileExplorerStore().fileSelectReturnValue = [
          ...useFileExplorerStore().fileSelectReturnValue,
          { windowId: foundSelectState.windowId, fileId: file.id, value: file.content },
        ];
        return;
      }

      await useOpenWindowByFileItem(file as Item & { content: FileItem });
    }
  }
}
