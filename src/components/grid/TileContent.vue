<template>
  <div class="tile-content-wrapper"
       :style="{
                width: `${TILE_WIDTH}px`,
                height: `${TILE_HEIGHT}px`,
                maxWidth: `${TILE_WIDTH}px`,
                maxHeight: `${TILE_HEIGHT}px`
              }"
       :title="stores.fileStore.desktopFiles[tilePosition]?.overflowing === true ? stores.fileStore.desktopFiles[tilePosition]?.name : null"
  >
    <div class="application-img" ref="applicationImg">
      <svg-component
          :svg-type="getSvgName(tilePosition)"
          :custom-width="IMAGE_WIDTH"
          :custom-height="IMAGE_HEIGHT"
      />
    </div>
    <div class="application-name" ref="applicationName"
         :class="{overflowing: stores.fileStore.desktopFiles[tilePosition]?.overflowing}"
         :style="{ fontSize: `${TILE_NAME_FONT_SIZE}px` }"
    >
      {{ getName() }}
    </div>
  </div>
</template>

<script>
import {useFileStore, useWindowStore} from "@/stores/globalState.ts";
import SvgComponent from "@/ui/svg-component.vue";

export default {
  name: "TileContent",
  components: {SvgComponent},
  props: {
    tilePosition: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      TILE_WIDTH: 82,
      TILE_HEIGHT: 82,
      IMAGE_WIDTH: 50,
      IMAGE_HEIGHT: 50,
      TILE_NAME_FONT_SIZE: 10
    }
  },
  computed: {
    stores() {
      return {
        'windowStore': useWindowStore(),
        'fileStore': useFileStore()
      }
    },
  },
  methods: {
    getName() {
      const desktopFile = this.stores.fileStore.desktopFiles[this.tilePosition]
      if (typeof desktopFile === 'undefined') {
        return;
      }

      if (desktopFile.overflowing === true) {
        return `${desktopFile.name.substring(0, 13)}...`;
      }

      return desktopFile.name;
    },
    getSvgName(tilePosition) {
      const applicationName = this.stores.fileStore.desktopFiles[tilePosition]?.name;
      if (!applicationName) {
        return;
      }
      if (applicationName.includes('.mp4')) {
        return 'osPlay';
      }
      return `os${applicationName[0].toUpperCase()}${applicationName.replaceAll(' ', '').slice(1)}`;
    }
  }
}
</script>

<style scoped>
.tile-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>