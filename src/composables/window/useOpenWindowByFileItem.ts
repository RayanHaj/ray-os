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
  switch (true) {
    case isImageType(file.content.rawFile.type):
      useImageViewerStore().initImageFileAndUrl(
        useWindowStore().getNextWindowId('Image Viewer'),
        file.content.rawFile,
      );
      break;
    case isVideoType(file.content.rawFile.type):
      useVideoPlayerStore().initVideoFileAndUrl(
        useWindowStore().getNextWindowId('Video Player'),
        file.content.rawFile,
      );
      break;
    case isAudioType(file.content.rawFile.type):
      useAudioPlayerStore().initAudioFileAndUrl(
        useWindowStore().getNextWindowId('Audio Player'),
        file.content.rawFile,
        file.id,
      );
      break;
    default:
      useNotepadStore().initializeNotepadFile(useWindowStore().getNextWindowId('Notepad'), {
        fileId: file.id,
        fileName: file.content.name,
        text: await file.content.rawFile.text(),
      });
  }
}
