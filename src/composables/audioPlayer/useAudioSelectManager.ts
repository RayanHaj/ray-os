import { type Ref, ref, watch } from 'vue';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useAddNewAudio } from '@/composables/audioPlayer/useAddNewAudio.ts';
import { useWindowStore } from '@/stores/window.ts';
import type { LoadedAudio } from '@/types/audioPlayerTypes.ts';

export function useAudioSelectManager(
  audioObject: Ref<HTMLAudioElement | null>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudioUrl: Ref<string | undefined>,
  currentLoadedPlaylistName: string,
  windowId: string,
) {
  const fileExplorerWindowId = ref<string>();
  watch(
    () => useFileExplorerStore().fileSelectReturnValue,
    async (returnValues) => {
      if (returnValues.length === 0) return;

      const returnValue = returnValues.find(
        (fileSelectState) => fileSelectState.windowId === windowId,
      );

      if (!returnValue || !fileExplorerWindowId.value) return;

      for (const value of returnValue.value) {
        if (!value.fileItem.rawFile) return;
        useAddNewAudio(
          audioObject,
          loadedAudios,
          currentLoadedAudioUrl,
          {
            windowId: windowId,
            file: value.fileItem.rawFile,
            fileId: value.fileId,
            isPlaying: false,
            playlistName: currentLoadedPlaylistName,
          },
          windowId,
        );
      }

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
    },
  );

  function useOpenSelectAudioWindow(windowId: string) {
    const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

    useFileExplorerStore().setFileExplorerWindowAsFileSelect(
      windowId,
      nextFileExplorerId,
      ['audio/mpeg', 'audio/mp4'],
      true,
    );

    fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
  }

  return { openSelectAudioWindow: useOpenSelectAudioWindow };
}
