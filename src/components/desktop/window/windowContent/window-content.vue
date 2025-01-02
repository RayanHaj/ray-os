<template>
  <component :is="windowName.replace(' ', '')"
             :disable-pointer-events="disablePointerEvents"
             :application-window-size="applicationWindowSize"
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

export default {
  name: "window-content",
  components: {
    SereneSounds,
    Browser,
    Settings,
    FileExplorer,
    Calculator,
    VideoPlayer
  },
  emits: ['moveCalculatorWindowToTopCorner'],
  props: {
    windowName: {
      type: String,
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
  }
}
</script>