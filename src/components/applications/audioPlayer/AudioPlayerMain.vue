<script setup lang="ts">
import AudioPlayerPlaylists from '@/components/applications/audioPlayer/AudioPlayerPlaylists.vue';

</script>
<template>
  <div class="audio-player">
    <div class="content">
      <AudioPlayerPlaylists />
    </div>
  </div>
</template>
<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  --audio-player-header-height: 50px;
}

.content {
  height: calc(100% - var(--audio-player-header-height));
}
</style>
