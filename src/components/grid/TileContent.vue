<template>
  <div class="tile-content-wrapper"
       :style="{
                width: `${TILE_WIDTH}px`,
                height: `${TILE_HEIGHT}px`,
                maxWidth: `${TILE_WIDTH}px`,
                maxHeight: `${TILE_HEIGHT}px`
              }"
       :title="fileStore.desktopFiles[tilePosition]?.overflowing === true ? fileStore.desktopFiles[tilePosition]?.name : null"
  >
    <div class="application-img" ref="applicationImg">
      <img :src="fileStore.desktopFiles[tilePosition]?.imageUrl" :width="IMAGE_WIDTH"
           :height="IMAGE_HEIGHT" :alt="fileStore.desktopFiles[tilePosition]?.imageUrl">
    </div>
    <div class="application-name" ref="applicationName"
         :class="{overflowing: fileStore.desktopFiles[tilePosition]?.overflowing}"
         :style="{ fontSize: `${TILE_NAME_FONT_SIZE}px` }"
    >
      {{ getName() }}
    </div>
  </div>
</template>

<script>
import {useFileStore, useWindowStore} from "@/stores/globalState";
import {mapStores} from "pinia";

export default {
  name: "TileContent",
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
    ...mapStores(useWindowStore, useFileStore)
  },
  methods: {
    getName() {
      const desktopFile = this.fileStore.desktopFiles[this.tilePosition]
      if (typeof desktopFile === 'undefined') {
        return;
      }

      if (desktopFile.overflowing === true) {
        return `${desktopFile.name.substring(0, 13)}...`;
      }

      return desktopFile.name;
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