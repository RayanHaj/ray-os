import {
  type FileSystemItem,
  isAudioType,
  isImageType,
  isVideoType,
  type Item,
} from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useNotepadStore } from '@/stores/notepad.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { Ref } from 'vue';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';

export async function useHandleExplorerFileClicked(
  item: FileSystemItem & { type: string },
  currentParentItemId: Ref<number | undefined>,
  rayDb: RayDb,
  windowId: string,
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
        const foundSelectState = useFileExplorerStore().fileSelectState.find(
          (element) => element.fileExplorerWindowId === windowId,
        );

        if (foundSelectState?.active) {
          useFileExplorerStore().isInFileSelectStateReturnValue = [
            ...useFileExplorerStore().isInFileSelectStateReturnValue,
            { windowId: foundSelectState.windowId, fileId: item.file.id, value: file.content },
          ];
          return;
        } else if (file.content.rawFile) {
          if (isImageType(item.file.type)) {
            useImageViewerStore().initImageFileAndUrl(
              useWindowStore().getNextWindowId('Image Viewer'),
              file.content.rawFile,
            );
            useWindowStore().pushOpenWindowReference('Image Viewer');
            return;
          } else if (isVideoType(item.file.type)) {
            useVideoPlayerStore().initVideoFileAndUrl(
              useWindowStore().getNextWindowId('Video Player'),
              file.content.rawFile,
            );
            useWindowStore().pushOpenWindowReference('Video Player');
            return;
          } else if (isAudioType(item.file.type)) {
            useAudioPlayerStore().initAudioFileAndUrl(
              useWindowStore().getNextWindowId('Audio Player'),
              file.content.rawFile,
            );
            useWindowStore().pushOpenWindowReference('Audio Player');
            return;
          }
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
