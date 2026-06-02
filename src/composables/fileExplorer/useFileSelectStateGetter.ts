import { computed } from 'vue';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

export const useFileSelectStateGetter = (windowId: string) => computed(
  () => {
    const fileSelectState = useFileExplorerStore().fileSelectState.find(
      (element) => element.fileExplorerWindowId === windowId,
    )

    return {
      active: fileSelectState?.active ?? false,
      targetWindowId: fileSelectState?.targetWindowId ?? '',
      allowedFileTypes: fileSelectState?.allowedFileTypes ?? [],
      multiSelect: fileSelectState?.multiSelect ?? false
    };
  }
);
