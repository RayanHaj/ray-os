import { type WindowName, windowNames } from '@/types/WindowTypes.ts';
import { type Component } from 'vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
import CalculatorMain from '@/components/applications/calculator/CalculatorMain.vue';
import PaintMain from '@/components/applications/paint/PaintMain.vue';
import FileExplorerMain from '@/components/applications/fileExplorer/FileExplorerMain.vue';
import SereneSoundsMain from '@/components/applications/sereneSounds/SereneSoundsMain.vue';
import TerminalMain from '@/components/applications/terminal/TerminalMain.vue';
import NotepadMain from '@/components/applications/notepad/NotepadMain.vue';
import { useWindowNameFormatter } from '@/composables/window/useWindowNameFormatter.ts';
import FallbackMain from '@/components/applications/FallbackMain.vue';
import DoomMain from '@/components/applications/doom/DoomMain.vue';
import ImageViewerMain from '@/components/applications/imageViewer/ImageViewerMain.vue';
import VideoPlayerMain from '@/components/applications/videoPlayer/VideoPlayerMain.vue';
import SnakeMain from '@/components/applications/snake/SnakeMain.vue';
import AudioPlayerMain from '@/components/applications/audioPlayer/AudioPlayerMain.vue';

const windowContentComponents: { [windowName in WindowName]: Component } = {
  settings: SettingsMain,
  calculator: CalculatorMain,
  paint: PaintMain,
  fileExplorer: FileExplorerMain,
  sereneSounds: SereneSoundsMain,
  terminal: TerminalMain,
  notepad: NotepadMain,
  doom: DoomMain,
  imageViewer: ImageViewerMain,
  videoPlayer: VideoPlayerMain,
  snake: SnakeMain,
  audioPlayer: AudioPlayerMain
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
