import { useMultiSelect } from '@/composables/helpers/useMultiSelect.ts';
import type { FileSystemItem } from '@/types/itemTypes.ts';

export async function useOnDragStart(
  event: DragEvent,
  multiSelect: ReturnType<typeof useMultiSelect<number>>,
  fileSystemItem: FileSystemItem,
  path: string
) {
  if (!multiSelect.isSelected(fileSystemItem.id)) {
    multiSelect.clear();
    multiSelect.toggle(fileSystemItem.id);
  }
  if (fileSystemItem.directory) {
    fileSystemItem.path = `${path}/${fileSystemItem.directory.name}`;
  }

  if (multiSelect.size() > 1) {
    const el = document.createElement('div');
    el.innerText = multiSelect.size().toString();

    el.style.width = '75px';
    el.style.height = '75px';
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.border = '1px dashed var(--input-border-color)';
    el.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    el.style.color = 'var(--text-color)';
    el.style.textAlign = 'end';
    el.style.paddingInline = '5px';
    document.body.appendChild(el);

    event.dataTransfer?.setDragImage(el, 75 / 2, 75 / 2);

    requestAnimationFrame(() => document.body.removeChild(el));
  }

  event.dataTransfer?.setData('text/plain', JSON.stringify(fileSystemItem));
}
