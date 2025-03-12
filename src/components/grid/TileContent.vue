<template>
  <div class="tile-content-wrapper"
       :style="{
                width: `${TILE_WIDTH}px`,
                height: `${TILE_HEIGHT}px`,
                maxWidth: `${TILE_WIDTH}px`,
                maxHeight: `${TILE_HEIGHT}px`
              }"
       :title="globalState.desktopFiles[tilePosition]?.overflowing === true ? globalState.desktopFiles[tilePosition].name : null"
  >
    <div class="application-img" ref="applicationImg">
      <img :src="globalState.desktopFiles[tilePosition]?.imageUrl" :width="IMAGE_WIDTH"
           :height="IMAGE_HEIGHT" :alt="globalState.desktopFiles[tilePosition]?.imageUrl">
    </div>
    <div class="application-name" ref="applicationName"
         :class="{overflowing: globalState.desktopFiles[tilePosition]?.overflowing}"
         :style="{ fontSize: `${TILE_NAME_FONT_SIZE}px` }"
    >
      {{
        globalState.desktopFiles[tilePosition]?.overflowing === false ? globalState.desktopFiles[tilePosition]?.name : `${globalState.desktopFiles[tilePosition]?.name.substring(0, 13)}...`
      }}
    </div>
  </div>
</template>

<script>
import {useGlobalState} from "@/stores/globalState";

export default {
  name: "TileContent",
  props: {
    tilePosition: {
      required: true,
      type: Number
    }
  },
  data() {
    return {
      TILE_WIDTH: 82,
      TILE_HEIGHT: 82,
      IMAGE_WIDTH: 50,
      IMAGE_HEIGHT: 50,
      TILE_NAME_FONT_SIZE: 10,
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
.tile-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>