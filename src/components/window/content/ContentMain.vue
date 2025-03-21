<template>
  <component :is="windowObject.name.replace(' ', '')"
             :disable-pointer-events="disablePointerEvents"
             :application-window-size="applicationWindowSize"
             :window-id="windowId"
             @move-calculator-window-to-top-corner="$emit('moveCalculatorWindowToTopCorner')"
  />
</template>

<script>
import FileExplorer from "@/components/window/content/fileExplorer/FileExplorerContent";
import Settings from "@/components/window/content/settings/SettingsContent";
import Browser from "@/components/window/content/browser/BrowserContent";
import SereneSounds from "@/components/window/content/sereneSounds/SereneSoundsContent";
import Calculator from "@/components/window/content/calculator/CalculatorContent";
import VideoPlayer from "@/components/window/content/videoPlayer/VideoPlayerContent";
import Games from "@/components/window/content/games/GameLauncher.vue";
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
    Games
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

<style scoped>
component {
  width: 100%;
  height: 100%;
}
</style>