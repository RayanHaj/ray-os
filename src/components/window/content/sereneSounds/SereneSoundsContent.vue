<template>
  <div class="content">
    <div class="audio-library-wrapper">
      <div class="audio-library-title">Audio library</div>
      <div class="audio-library">
        <div class="audio-card"
             v-for="sound in sounds"
             :key="sound.id"
             :class="sound.id"
             @dragstart="dragAndDropEventListeners($event, sound, 'dragstart')"
             draggable="true"
        >
          <div class="audio-name card-child">{{ sound.name }}</div>
          <button class="audio-play-button card-child" @click="playAudio($event, sound.id, 'audioLibrary')">{{ this.currentAudioId === sound.id ? 'pause' : 'play' }}</button>
          <audio class="audio-source card-child" :ref="'audioLibrary'+sound.id" :src="sound.previews['preview-hq-mp3']"></audio>
        </div>
      </div>
    </div>
    <div class="playlist" @dragover.prevent @drop="dragAndDropEventListeners($event, null,'drop')">
      <div class="playlist-title">Playlist</div>
      <div class="playlist-audio-card"
           v-for="sound in playlistSounds"
           :key="sound.id"
           :class="sound.id"
           @dragstart="dragAndDropEventListeners($event, 'dragstart')"
           draggable="true"
      >
        <div class="playlist-audio-name">{{ sound.name }}</div>
        <button class="playlist-audio-play-button" @click="playAudio($event, sound.id, 'playlist')">{{ this.currentAudioId === sound.id ? 'pause' : 'play' }}</button>
        <audio class="playlist-audio-source" :ref="'playlist'+sound.id" :src="sound.previews['preview-hq-mp3']"></audio>
      </div>
    </div>
  </div>
</template>
<script>

import json from "@/assets/json/config.json"

export default {
  name: "serene-sounds-window",
  data() {
    return {
      backendUrl: 'http://localhost:3000',
      sounds: json.sounds,
      soundDetails: {},
      currentAudioId: null,
      currentDraggedAudio: null,
      playlistSounds: []
    }
  },

  mounted() {
    let array = [];
    this.sounds.forEach(sound => {
      array.push({
        "id": sound.id,
        "url": sound.url,
        "name": sound.name,
        "tags": sound.tags,
        "license": sound.license,
        "duration": sound.duration,
        "username": sound.username,
        "previews": sound.previews
      })
    });
  },

  methods: {
    playAudio(event, id, type) {
      let audioCard = event.currentTarget.parentElement;
      let soundElement = null;

      if (type === 'playlist') {
        soundElement = audioCard.querySelector('.playlist-audio-source');
      } else if (type === 'audioLibrary') {
        soundElement = audioCard.querySelector('.audio-source');
      } else {
        return;
      }

      if (this.currentAudioId) {
        this.$refs[type + this.currentAudioId][0].pause();

        if (this.currentAudioId === id) {
          this.currentAudioId = null;
          return;
        }
      }
      soundElement.play();
      this.currentAudioId = id;
    },
    dragAndDropEventListeners(event, sound, type) {
      switch (type) {
        case 'drop': {
          let elementOnMousePosition = document.elementFromPoint(event.x, event.y);

          if (this.playlistSounds.length === 0) {
            this.playlistSounds.push(this.currentDraggedAudio);
            return;
          }

          if (elementOnMousePosition.classList.contains('card-child') && this.playlistSounds.length > 0) {
            elementOnMousePosition = elementOnMousePosition.parentElement;
          }

          if (!elementOnMousePosition.classList.contains('playlist-audio-card') && this.playlistSounds.length > 0) {
            return;
          }

          const idAudioCard = this.getAudioCardId(elementOnMousePosition, 'playlist');
          const indexElementOnMousePosition = this.getPositionAudioInPlaylist(idAudioCard);

          if (indexElementOnMousePosition !== -1) {
            this.playlistSounds.splice(indexElementOnMousePosition, 0, this.currentDraggedAudio)
          }
          this.$el.cursor = 'auto'
          break;
        }
        case 'dragstart': {
          this.currentDraggedAudio = sound;
          break;
        }
      }
    },
    getAudioCardId(audioCard, type) {
      let audioName = null;
      switch (type) {
        case 'playlist':
          audioName = audioCard.querySelector('.playlist-audio-name').innerText;
          break;
        case 'audioLibrary':
          audioName = audioCard.querySelector('.audio-name').innerText;
          break;
      }

      if (audioName === null) {
        return returnId;
      }

      let returnId = -1;
      for (let sound of this.sounds) {
        if (sound.name === audioName) {
          returnId = sound.id;
        }
      }

      return returnId;
    },
    getPositionAudioInPlaylist(id) {
      for (let i = 0; i < this.playlistSounds.length; i++) {
        if (this.playlistSounds[i].id === id) {
          return i;
        }
      }

      return -1;
    }
  }
}
</script>
<style scoped>
.content {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.audio-library-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 60%;
}

.audio-library-title {
  font-family: 'Verdana', serif;
  font-size: 30px;
  font-weight: bold;
  font-style: italic;
}

.audio-library {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 120px 120px;
  gap: 5px;
  overflow: auto;
}

.playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 40%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.audio-card, .playlist-audio-card {
  display: flex;
  font-size: 15px;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
  min-height: 100px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 10px;
}
.audio-card {
  width: 150px;
}

.playlist-audio-card {
  width: 80%;
}

.audio-play-button, .playlist-audio-play-button {
  width: 100%;
}

.playlist-title {
  font-family: 'Verdana', serif;
  font-size: 30px;
  font-weight: bold;
  font-style: italic;
  color: white;
}
</style>
