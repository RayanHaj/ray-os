<template>
  <component :is="windowName.replace(' ', '')" @theme-changed="$emit('themeChanged')" :disable-pointer-events="disablePointerEvents"/>
</template>

<script>
import FileExplorer from "@/components/desktop/window/windowContent/fileExplorer/file-explorer-window";
import Settings from "@/components/desktop/window/windowContent/settings/settings-window";
import Browser from "@/components/desktop/window/windowContent/browser/browser-window";
import SereneSounds from "@/components/desktop/window/windowContent/sereneSounds/serene-sounds-window";

export default {
  name: "window-content",
  components: {
    SereneSounds,
    Browser,
    Settings,
    FileExplorer
  },
  emits: ['themeChanged'],
  props: {
    windowName: {
      type: String,
      required: true
    },
    disablePointerEvents: {
      type: Boolean,
      required: false
    }
  }
}
</script>