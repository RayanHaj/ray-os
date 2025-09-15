import type { FileSystemItem, FileType, Item } from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useSetFileSelectedValue } from '@/composables/fileExplorer/useSetFileSelectedValue.ts';
import { useNotepadStore } from '@/stores/notepad.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';

export async function useHandleExplorerFileClicked(
  item: FileSystemItem & { type: string },
  currentParentItemId: Ref<number | undefined>,
  isInFileSelectState: Ref<{
    state: boolean;
    windowId: string;
    allowedFileTypes: FileType[];
  } | null>,
  rayDb: RayDb
) {
  if (!item.file) return;

  switch (item.type) {
    case 'application':
      useWindowStore().pushOpenWindowReference(item.file.name);
      break;
    case 'file': {
      const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
      if (!file) {
        return;
      }
      if (file.content.type === 'file') {
        if (isInFileSelectState.value?.state) {
          useSetFileSelectedValue(isInFileSelectState.value.windowId, item.file.id, file.content);
          return;
        } else if (file.content.rawFile) {
          // switch (file.content.rawFile.type) {
          //   case 'text/plain':
          //     {
          //     }
          //     break;
          //   case 'video/mp4': {
          //   }
          // }
          useNotepadStore().initializeNotepadFile(
            useWindowStore().getNextWindowId('Notepad'),
            item.file.id,
            file.content.name,
            await file.content.rawFile.text(),
          );
          useWindowStore().pushOpenWindowReference('Notepad');
        }
      }
    }
  }

  currentParentItemId.value = item.id;
}
