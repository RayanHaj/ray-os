import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { type FileSystemItem, isAudioType, isImageType, isVideoType } from '@/types/itemTypes.ts';

export function useGetSvgByFileSystemItem(fileSystemItem: FileSystemItem) {
  const imageSvg = useSvgOrFallback('ImageViewer');
  const videoSvg = useSvgOrFallback('VideoPlayer');
  const audioSvg = useSvgOrFallback('Audio');
  const fileSvg = useSvgOrFallback('TextFile');
  const directorySvg = useSvgOrFallback('Directory');

  switch (fileSystemItem.type) {
    case 'application': {
      if (fileSystemItem.file?.name) {
        return useSvgOrFallback(fileSystemItem.file.name).svg;
      } else {
        return fileSvg.svg;
      }
    }
    case 'file': {
      if (isImageType(fileSystemItem.file?.type)) {
        return imageSvg.svg;
      }
      if (isVideoType(fileSystemItem.file?.type)) {
        return videoSvg.svg;
      }
      if (isAudioType(fileSystemItem.file?.type)) {
        return audioSvg.svg;
      }
      return fileSvg.svg;
    }
    case 'directory': {
      return directorySvg.svg;
    }
    default: {
      return fileSvg.svg;
    }
  }
}
