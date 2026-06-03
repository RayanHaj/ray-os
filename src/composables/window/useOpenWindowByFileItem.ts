import {
  type FileItem,
  isAudioType,
  isImageType,
  isVideoType,
  type Item,
} from '@/types/itemTypes.ts';
import { useImageViewerStore } from '@/stores/imageViewer.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useVideoPlayerStore } from '@/stores/videoPlayer.ts';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useNotepadStore } from '@/stores/notepad.ts';

export async function useOpenWindowByFileItem(file: Item & { content: FileItem }) {
  if (file.content.rawFile) {
    if (isImageType(file.content.rawFile.type)) {
      useImageViewerStore().initImageFileAndUrl(
        useWindowStore().getNextWindowId('Image Viewer'),
        file.content.rawFile,
      );
      useWindowStore().pushOpenWindowReference('Image Viewer');
      return;
    } else if (isVideoType(file.content.rawFile.type)) {
      useVideoPlayerStore().initVideoFileAndUrl(
        useWindowStore().getNextWindowId('Video Player'),
        file.content.rawFile,
      );
      useWindowStore().pushOpenWindowReference('Video Player');
      return;
    } else if (isAudioType(file.content.rawFile.type)) {
      useAudioPlayerStore().initAudioFileAndUrl(
        useWindowStore().getNextWindowId('Audio Player'),
        file.content.rawFile,
        file.id
      );
      useWindowStore().pushOpenWindowReference('Audio Player');
      return;
    }
    useNotepadStore().initializeNotepadFile(
      useWindowStore().getNextWindowId('Notepad'),
      file.id,
      file.content.name,
      await file.content.rawFile.text(),
    );
    useWindowStore().pushOpenWindowReference('Notepad');
  }
}
