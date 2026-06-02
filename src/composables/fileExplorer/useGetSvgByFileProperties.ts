import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import type { FileProperties } from '@/stores/fileProperties.ts';

export function useGetSvgByFileProperties(fileProperties: FileProperties) {
  const imageSvg = useSvgOrFallback('ImageViewer');
  const videoSvg = useSvgOrFallback('VideoPlayer');
  const audioSvg = useSvgOrFallback('Audio');
  const fileSvg = useSvgOrFallback('TextFile');
  const directorySvg = useSvgOrFallback('Directory');

  switch (fileProperties.type) {
    case 'Application': {
      const svg = useSvgOrFallback(fileProperties.name);
      if (svg.found) {
        return svg.svg;
      } else {
        return fileSvg.svg;
      }
    }
    case 'File': {
      return fileSvg.svg;
    }
    case 'Directory': {
      return directorySvg.svg;
    }
    case 'audio/mpeg': {
      return audioSvg.svg;
    }
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp': {
      return imageSvg.svg;
    }
    case 'video/mp4': {
      return videoSvg.svg;
    }
    case 'text/plain': {
      return fileSvg.svg;
    }
    default: {
      return fileSvg.svg;
    }
  }
}
