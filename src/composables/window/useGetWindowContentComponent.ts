import type { WindowName } from '@/types/WindowTypes.ts';
import { type Component } from 'vue';
import SettingsMain from '@/components/applications/settings/SettingsMain.vue';
import CalculatorMain from '@/components/applications/calculator/CalculatorMain.vue';
import PaintMain from '@/components/applications/paint/PaintMain.vue';
import FileExplorerMain from '@/components/applications/fileExplorer/FileExplorerMain.vue';
import SereneSoundsMain from '@/components/applications/sereneSounds/SereneSoundsMain.vue';
import TerminalMain from '@/components/applications/terminal/TerminalMain.vue';
import TodoMain from '@/components/applications/todo/todoMain.vue';
import NotepadMain from '@/components/applications/notepad/NotepadMain.vue';

const windowContentComponents: { [windowName in WindowName]: Component } = {
  settings: SettingsMain,
  calculator: CalculatorMain,
  paint: PaintMain,
  fileExplorer: FileExplorerMain,
  sereneSounds: SereneSoundsMain,
  terminal: TerminalMain,
  todo: TodoMain,
  notepad: NotepadMain
};

export function useGetWindowContentComponent(windowName: WindowName) {
  return windowContentComponents[windowName];
}
