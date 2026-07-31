import { computed } from 'vue';
import { useFileSelectStateGetter } from '@/composables/fileExplorer/useFileSelectStateGetter.ts';
import { fileExtensions } from '@/types/itemTypes.ts';

export function useGetWindowTitle(windowName: string, windowId: string) {
  const buildFileSelectString = () => {
    const fileSelectStateGetter = useFileSelectStateGetter(windowId).value;

    if (!fileSelectStateGetter.active) return;

    const stringBuilder = ['select'];

    if (!fileSelectStateGetter.multiSelect) stringBuilder.push('a');

    stringBuilder.push(
      fileSelectStateGetter.allowedFileTypes.map((type) => `.${fileExtensions[type]}`).join('/'),
    );

    stringBuilder.push(fileSelectStateGetter.multiSelect ? 'files' : 'file');

    return stringBuilder.join(' ');
  };

  return computed(() => buildFileSelectString() ?? windowName);
}
