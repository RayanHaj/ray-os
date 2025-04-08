<template>
  <component :is="windowObject.name.replace(' ', '')"
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
import {useWindowStore} from "@/stores/globalState";
import {mapStores} from "pinia";

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
  props: {
    windowId: {
      type: Number,
      required: true
    },
    applicationWindowSize: {
      type: Object,
      required: false
    }
  },
  computed: {
    ...mapStores(useWindowStore),

    windowObject() {
      return this.windowStore.openWindows.find(window => window.id === this.windowId);
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