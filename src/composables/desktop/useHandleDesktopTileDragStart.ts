import type { DesktopTileItem } from '@/types/desktopTypes.ts';

export function useHandleDesktopTileDragStart(event: DragEvent, desktopTileItem: DesktopTileItem) {
  const id = desktopTileItem.id;
  const type = desktopTileItem.content.type;

  event?.dataTransfer?.setData('text/plain', JSON.stringify({ id, type }));
  setDragImage(event);
}

function setDragImage(event: DragEvent) {
  const contentEl = (event.currentTarget as HTMLElement).querySelector('.content') as HTMLElement;
  if (!contentEl || !event.dataTransfer) return;

  const clone = contentEl.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.padding = '5px';
  clone.style.borderRadius = '5px';
  document.body.appendChild(clone);

  event.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, clone.offsetHeight / 2);

  requestAnimationFrame(() => document.body.removeChild(clone));
}
