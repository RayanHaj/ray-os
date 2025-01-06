<template>
  <div class="video-player-container">
    <video v-if="videoSrc" :src="videoSrc" class="video" ref="video" @loadedmetadata="initVideoData"/>
    <section v-if="videoSrc" class="video-controls">
      <button>
        <svg-component svg-type="play" custom-width="25" custom-height="25"/>
      </button>
      <div class="video-progress">
        <div>{{ videoCurrentTime }}</div>

        <input v-model="videoCurrentTime" type="range" min="0.00" :max="videoLength" step="0.01" class="video-progress-range">
        <div>{{ videoLength.toFixed(2) }}</div>
      </div>
      <div class="video-buttons-right">
        <button v-for="type in ['volume', 'in picture', 'fullscreen']" :key="type">
          <svg-component :svg-type="type" custom-width="25" custom-height="25"/>
        </button>
      </div>
    </section>
    <section v-else class="video-library">
      <h1>Video's</h1>
      <div v-if="videoList.length === 0">
        <p>No videos found</p>
      </div>
      <ul v-else class="video-list-wrapper">
        <li v-for="video in videoList" @dblclick="openVideo(video)" :key="video.name" class="video-element">
          <video :src="video.videoUrl" :id="video" class="video-thumbnail"></video>
          <div class="video-name">
            {{ video.name.length > 70 ? `${video.name.substring(0, 70)}...` : video.name }}
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import json from '@/assets/json/config'
import {useGlobalState} from "@/stores/globalState";
import SvgComponent from "@/components/ui/svg-component";

export default {
  name: "video-player-window",
  components: {SvgComponent},
  data() {
    return {
      videos: json.videos,
      toggleVideoPlayerControls: false,
      videoSrc: null,
      windowObject: null,
      videoList: [],
      videoCurrentTime: 0.00,
      videoLength: 0.00,
    }
  },
  inject: ['db', 'provide'],
  computed: {
    globalState() {
      return useGlobalState();
    },
  },
  beforeMount() {
    this.windowObject = this.globalState.openWindows.find(window => window.id === this.windowId);

    this.db.getElementByType('files', 'video/mp4').then(elements => {
      elements.forEach(element => {
        element.videoUrl = URL.createObjectURL(element.file);
        this.videoList.push(element);
      })
    });

    if (this.windowObject.values.files) {
      this.videoSrc = URL.createObjectURL(this.windowObject.values.file);
    }
  },
  props: {
    fileObject: {
      type: File,
      required: false
    },
    windowId: {
      type: Number,
      required: true
    }
  },
  methods: {
    initVideoData() {
      this.videoLength = this.$refs.video.duration;
    },
    openVideo(video) {
      this.videoSrc = video.videoUrl;
    },
    pauseVideo() {
      const videoElement = this.$refs.video;
      if (videoElement) {
        videoElement.pause();
      }
    },
    playVideo() {
      const videoElement = this.$refs.video;
      if (videoElement) {
        videoElement.play();
      }
    },
    updateVideoTime(newTime) {
      console.log(newTime)
    }
  }
}
</script>

<style scoped>
* {
  color: var(--font-color);
  box-sizing: border-box;
}

.video-player-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.video-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.video-list-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(130px, 1fr));
  justify-items: center;
  user-select: none;
  width: 100%;
  height: 100%;
}

.video-element {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-wrap: break-word;
  width: 140px;
  height: 140px;
}

.video-element:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.video-name {
  overflow-wrap: anywhere;
}

.video-thumbnail {
  width: 100px;
  pointer-events: none;
}

.video {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 85%;
  position: absolute;
  top: 5%;
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