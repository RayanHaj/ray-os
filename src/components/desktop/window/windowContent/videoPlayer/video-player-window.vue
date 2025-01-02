<template>
  <div class="video-player-container">
    <div class="video-player-wrapper">
      <video :src="videoSrc">
      </video>
    </div>
    <div class="video-controls">
      <div class="play-button-wrapper">
        <button class="play-button">
          <svg-component svg-type="play" custom-width="25" custom-height="25"/>
        </button>
      </div>
      <div class="video-progress">
        <div>0:03</div>
        <input class="video-progress-range" type="range">
        <div>0:05</div>
      </div>
      <div class="video-buttons-right">
        <button>
          <svg-component svg-type="volume" custom-width="25" custom-height="25"/>
        </button>
        <button>
          <svg-component svg-type="in picture" custom-width="25" custom-height="25"/>
        </button>
        <button>
          <svg-component svg-type="fullscreen" custom-width="25" custom-height="25"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import json from '@/assets/json/config'
import { useGlobalState } from "@/stores/globalState";
import SvgComponent from "@/components/ui/svg-component";

export default {
  name: "video-player-window",
  components: {SvgComponent},
  data() {
    return {
      videos: json.videos,
      toggleVideoPlayerControls: false,
      videoSrc: null
    }
  },
  inject: ['db', 'provide'],
  computed: {
    globalState() {
      return useGlobalState();
    },
  },
  mounted() {
    this.videoSrc = URL.createObjectURL(this.fileObject.file);
  },
  props: {
    fileObject: {
      type: File,
      required: false
    }
  }
}
</script>

<style scoped>
* {
  color: var(--font-color);
}

.video-player-container {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
}

.video-player-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 85%;
}

video {
  position: absolute;
  top: 5%;
  width: 100%;
  height: 83%;
  object-fit: contain;
}

.video-progress {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 60%;
}

.video-progress-range {
  width: 100%;
}

button {
  background-color: var(--background-color-input);
  border-color: var(--border-input-color);
  height: 100%;
}

.video-controls {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  position: absolute;
  gap: 2px;
  width: 100%;
  height: 32px;
  bottom: 0;
  background-color: var(--background-color);
  object-fit: contain;
}

</style>