<template>
  <div class="video-player-container">
    <video v-if="videoSrc !== null" :src="videoSrc" class="video" ref="video" @loadedmetadata="initVideoData" @timeupdate="videoCurrentTime = $event.currentTarget.currentTime"/>
    <section v-if="videoSrc !== null" class="video-controls">
      <button @click="playVideo">
        <svg-component v-if="videoPlaying" svg-type="pause" custom-width="25" custom-height="15"/>
        <svg-component v-else svg-type="play" custom-width="25" custom-height="25"/>
      </button>
      <div class="video-progress">
        <input v-model="videoCurrentTime" @mouseover.stop @mousemove.stop @input="updateVideoTime"
               type="range" :min="0.00" :max="videoLength" step="0.01" class="video-progress-range" ref="videoProgressRange">
      </div>
      <div class="video-buttons-right">
        <div class="volume-wrapper">
          <div v-show="soundButtonClicked" class="volume-menu">
            <button v-for="i in Array.from({ length: 6 }, (_, index) => 5 - index)"
                    :key="i" @click="onClickSoundLevel(i)" style="user-select: none"
            >
              {{ i === 0 ? '0' : '|'.repeat(Number(i)) }}
            </button>
          </div>
          <button @click="rightVideoButtonsClickHandler($event, 'volume')">
            <svg-component svg-type="volume" custom-width="25" custom-height="25"/>
          </button>
        </div>
        <button @click="rightVideoButtonsClickHandler($event, 'in picture')">
          <svg-component svg-type="in picture" custom-width="25" custom-height="25"/>
        </button>
        <button @click="rightVideoButtonsClickHandler($event, 'fullscreen')">
          <svg-component svg-type="fullscreen" custom-width="25" custom-height="25"/>
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
import SvgComponent from "@/ui/svg-component";

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
      videoPlaying: false,
      soundButtonClicked: false,
    }
  },
  inject: ['db', 'provide'],
  computed: {
    globalState() {
      return useGlobalState();
    },
  },
  watch: {
    videoCurrentTime(newValue) {
      if (newValue === this.videoLength) {
        this.videoCurrentTime = 0;
        this.videoPlaying = false;
      }
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
  beforeMount() {
    this.windowObject = this.globalState.openWindows.find(window => window.id === this.windowId);

    this.db.getElementByType('files', 'video/mp4').then(elements => {
      elements.forEach(element => {
        element.videoUrl = URL.createObjectURL(element.file);
        this.videoList.push(element);
      })
    });

    if (this.windowObject.values.file) {
      this.videoSrc = URL.createObjectURL(this.windowObject.values.file);
    }
  },
  methods: {
    initVideoData() {
      this.videoLength = this.$refs.video.duration;
    },
    openVideo(video) {
      this.videoSrc = video.videoUrl;
    },
    playVideo() {
      const videoElement = this.$refs.video;

      if (videoElement && this.videoPlaying === true) {
        videoElement.pause();
        this.videoPlaying = false;
        return;
      }

      videoElement.play();
      this.videoPlaying = true;
    },
    rightVideoButtonsClickHandler(event, type) {
      const videoElement = this.$refs.video;
      if (videoElement === null) {
        return;
      }
      switch (type) {
        case 'fullscreen': {
          videoElement.requestFullscreen();
          break;
        }
        case 'volume': {
          this.soundButtonClicked = !this.soundButtonClicked;
          break;
        }
      }
    },
    updateVideoTime() {
      this.$refs.video.currentTime = this.videoCurrentTime;
    },
    onClickSoundLevel(level) {
      const videoElement = this.$refs.video;
      if (videoElement) {
        videoElement.volume = level === 0 ? 0 : (level / 10)
      }
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

.video-buttons-right {
  display: flex;
  flex-direction: row;
}

.volume-wrapper {
  position: relative;
}

.volume-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 100%;
  width: 100%;
}

</style>