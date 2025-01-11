<template>
  <component :is="windowObject.name.replace(' ', '')"
             :disable-pointer-events="disablePointerEvents"
             :application-window-size="applicationWindowSize"
             :window-id="windowId"
             @move-calculator-window-to-top-corner="$emit('moveCalculatorWindowToTopCorner')"
  />
</template>

<script>
import FileExplorer from "@/components/desktop/window/windowContent/fileExplorer/file-explorer-window";
import Settings from "@/components/desktop/window/windowContent/settings/settings-window";
import Browser from "@/components/desktop/window/windowContent/browser/browser-window";
import SereneSounds from "@/components/desktop/window/windowContent/sereneSounds/serene-sounds-window";
import Calculator from "@/components/desktop/window/windowContent/calculator/calculator-window";
import VideoPlayer from "@/components/desktop/window/windowContent/videoPlayer/video-player-window";
import BlockGame from "@/components/desktop/window/windowContent/games/block-game";
import { useGlobalState } from "@/stores/globalState";

export default {
  name: "window-content",
  components: {
    SereneSounds,
    Browser,
    Settings,
    FileExplorer,
    Calculator,
    VideoPlayer,
    BlockGame
  },
  emits: ['moveCalculatorWindowToTopCorner'],
  data() {
    return {
      windowObject: null
    }
  },
  beforeMount() {
    this.windowObject = this.globalState.openWindows.find(window => window.id === this.windowId);
  },
  props: {
    windowId: {
      type: Number,
      required: true
    },
    disablePointerEvents: {
      type: Boolean,
      required: false
    },
    applicationWindowSize: {
      type: Object,
      required: false
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  }
}
</script>