import type { Ref } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

export function useOpenSelectAudioWindow(fileExplorerWindowId: Ref<string | undefined>, windowId: string) {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, nextFileExplorerId, [
    'audio/mpeg',
  ]);

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}
