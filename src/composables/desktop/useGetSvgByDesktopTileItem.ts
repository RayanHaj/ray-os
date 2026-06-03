import type { DesktopTileItem } from '@/types/desktopTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { isAudioType, isImageType, isVideoType } from '@/types/itemTypes.ts';

export function useGetSvgByDesktopTileItem(desktopTileItem: DesktopTileItem) {
  const imageSvg = useSvgOrFallback('ImageViewer');
  const videoSvg = useSvgOrFallback('VideoPlayer');
  const audioSvg = useSvgOrFallback('Audio');
  const fileSvg = useSvgOrFallback('TextFile');
  const directorySvg = useSvgOrFallback('Directory');

  switch (desktopTileItem.content.type) {
    case 'application': {
      if (desktopTileItem.label) {
        return useSvgOrFallback(desktopTileItem.label).svg;
      } else {
        return fileSvg.svg;
      }
    }
    case 'file': {
      if (isImageType(desktopTileItem.content.rawFile?.type)) {
        return imageSvg.svg;
      }
      if (isVideoType(desktopTileItem.content.rawFile?.type)) {
        return videoSvg.svg;
      }
      if (isAudioType(desktopTileItem.content.rawFile?.type)) {
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
