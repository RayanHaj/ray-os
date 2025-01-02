<template>
  <div class="video-player-wrapper">
      <video :src="require(`@/assets/videos/${videos[0]}`)" controls/>
  </div>
</template>

<script>
import json from '@/assets/json/config'
import { useGlobalState } from "@/stores/globalState";

export default {
  name: "video-player-window",
  data() {
    return {
      videos: json.videos,
      toggleVideoPlayerControls: false,
    }
  },
  async mounted() {

  },
  computed: {
    globalState() {
      return useGlobalState();
    },
  },
  props: {}
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  color: var(--font-color);
}

.video-player-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

video {
  margin: 1rem;
  width: 85%;
  height: auto;
  object-fit: fill;
  border-radius: 5px;
}

</style>