import { useWindowStore } from '@/stores/window.ts';
import { useBrowserStore } from '@/stores/browser.ts';

export function useGetWindowOutOfBoundsPositionValues() {
  const heightExcTaskbar = useBrowserStore().heightExcTaskbar;
  const { side, windowId } = useWindowStore().windowOutOfBounds;
  if (!side || !windowId) return null;

  const values: {
    side: typeof side;
    positions: { left: string; top: string; width: string; height: string };
  } = { side: side, positions: { left: '0', top: '0', width: '0', height: '0' } };

  switch (side) {
    case 'left':
      {
        values.positions = { left: '0', top: '0', width: '50%', height: `${heightExcTaskbar}px` };
      }
      break;
    case 'right':
      {
        values.positions = { left: '50%', top: `0`, width: '50%', height: `${heightExcTaskbar}px` };
      }
      break;
    case 'top':
      {
        values.positions = {
          left: '0',
          top: `0`,
          width: '100%',
          height: `${heightExcTaskbar / 2}px`,
        };
      }
      break;
    case 'bottom': {
      values.positions = {
        left: '0',
        top: `${heightExcTaskbar / 2}px`,
        width: '100%',
        height: `${heightExcTaskbar / 2}px`,
      };
    }
  }

  return values;
}
