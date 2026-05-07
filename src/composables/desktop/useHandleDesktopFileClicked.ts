import { isImageType, isTextType, isVideoType, type Item } from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useNotepadStore } from '@/stores/notepad.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { parseToPathArray } from '@/composables/fileSystem/useIndexedDbHelper.ts';

export async function useHandleDesktopFileClicked(
  item: Item & { tileId: number },
  rayDb: RayDb,
) {
  switch (item.content.type) {
    case 'application':
      useWindowStore().pushOpenWindowReference(item.label);
      break;
    case 'file': {
      const file = await rayDb.findOne<Item>('files', 'id', item.id);
      if (!file) {
        return;
      }

      if (file.content.type === 'file') {
        if (file.content.rawFile) {
          if (isImageType(item.content.rawFile?.type)) {
            useImageViewerStore().initImageFileAndUrl(
              useWindowStore().getNextWindowId('Image Viewer'),
              file.content.rawFile,
            );
            useWindowStore().pushOpenWindowReference('Image Viewer');
          } else if (isVideoType(item.content.rawFile?.type)) {
            useVideoPlayerStore().initVideoFileAndUrl(
              useWindowStore().getNextWindowId('Video Player'),
              file.content.rawFile,
            );
            useWindowStore().pushOpenWindowReference('Video Player');
          } else if (isTextType(item.content.rawFile?.type)) {
            useNotepadStore().initializeNotepadFile(
              useWindowStore().getNextWindowId('Notepad'),
              item.id,
              file.content.name,
              await file.content.rawFile.text(),
            );
            useWindowStore().pushOpenWindowReference('Notepad');
          }
        }
      }
    } break;
    case 'directory': {
      const nextWindowId = useWindowStore().getNextWindowId('File Explorer');

      if (!item.path) {
        return;
      }

      useFileExplorerStore().setFilePathAtWindow(nextWindowId, parseToPathArray(item.path));
      useWindowStore().pushOpenWindowReference('File Explorer');
    }
  }
}
