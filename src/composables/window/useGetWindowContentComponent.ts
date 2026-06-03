import { type WindowName, windowNames } from '@/types/windowTypes.ts';
import { type Component } from 'vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
import CalculatorMain from '@/components/applications/calculator/CalculatorMain.vue';
import FileExplorerMain from '@/components/applications/fileExplorer/FileExplorerMain.vue';
import TerminalMain from '@/components/applications/terminal/TerminalMain.vue';
import NotepadMain from '@/components/applications/notepad/NotepadMain.vue';
import FallbackMain from '@/components/applications/FallbackMain.vue';
import ImageViewerMain from '@/components/applications/mediaPlayers/imageViewer/ImageViewerMain.vue';
import VideoPlayerMain from '@/components/applications/mediaPlayers/videoPlayer/VideoPlayerMain.vue';
import AudioPlayerMain from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerMain.vue';
import FilePropertiesMain from '@/components/applications/FilePropertiesMain.vue';

import { useWindowNameFormatter } from '@/composables/window/useWindowNameFormatter.ts';

const windowContentComponents: { [windowName in WindowName]: Component } = {
  settings: SettingsMain,
  calculator: CalculatorMain,
  fileExplorer: FileExplorerMain,
  terminal: TerminalMain,
  notepad: NotepadMain,
  imageViewer: ImageViewerMain,
  videoPlayer: VideoPlayerMain,
  audioPlayer: AudioPlayerMain,
  properties: FilePropertiesMain,
} as const;

export function useGetWindowContentComponent(windowName: string) {
  const formattedComponentName = useWindowNameFormatter(windowName);
  if (formattedComponentName === undefined) {
    return FallbackMain;
  }
  if (!windowNames.includes(formattedComponentName)) {
    return FallbackMain;
  }

  return windowContentComponents[formattedComponentName];
}
