import { useToastStore } from '@/stores/toast.ts';

export async function useRequestFullscreenVideo(video: HTMLElement | null, windowId?: string) {
  if (!video) return;

  try {
    if (useIsInFullscreen()) {
      await document.exitFullscreen();
    } else {
      await video.requestFullscreen();
    }
  } catch (e) {
    console.error(e);
    useToastStore().createToast(
      'Cannot fullscreen videos on this device because of browser limitations',
      'error',
      2000,
      windowId ? 'window' : 'desktop',
      windowId,
    );
  }
}

export const useIsInFullscreen = () => document.fullscreenElement?.nodeName === 'DIV';
