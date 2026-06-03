import {
  type FileItem,
  type Item,
} from '@/types/itemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { parseToPathArray } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useOpenWindowByFileItem } from '@/composables/window/useOpenWindowByFileItem.ts';

export async function useHandleDesktopFileClicked(item: Item & { tileId: number }, rayDb: RayDb) {
  switch (item.content.type) {
    case 'application':
      handleApplicationClicked();
      break;
    case 'file':
      await handleFileClicked();
      break;
    case 'directory':
      handleDirectoryClicked();
      break;
  }

  function handleApplicationClicked() {
    useWindowStore().pushOpenWindowReference(item.label);
  }

  async function handleFileClicked() {
    const file = await rayDb.findOne<Item>('files', 'id', item.id);

    if (!file || file.content.type !== 'file') return;

    await useOpenWindowByFileItem(file as Item & { content: FileItem });
  }

  function handleDirectoryClicked() {
    const nextWindowId = useWindowStore().getNextWindowId('File Explorer');
    console.log(item)
    if (!item.path) {
      return;
    }

    useFileExplorerStore().setFilePathAtWindow(nextWindowId, parseToPathArray(item.path));
    useWindowStore().pushOpenWindowReference('File Explorer');
  }
}
