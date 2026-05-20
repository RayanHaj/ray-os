<script setup lang="ts">
import { computed, onMounted, onUnmounted, type Ref, ref, watch } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';
import type { LoadedAudio, PlaylistInsert } from '@/types/AudioPlayerTypes.ts';
import AudioPlayerListItem from '@/components/applications/audioPlayer/AudioPlayerListItem.vue';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import AudioPlayerHeader from '@/components/applications/audioPlayer/AudioPlayerHeader.vue';
import type { RayDb } from 'ray-db-wrapper';

const audioPlayerStore = useAudioPlayerStore();

const windowId = useInjectOrThrow<string>('windowId');

const loadedAudios: Ref<LoadedAudio[]> = ref([]);
const currentLoadedAudioIndex = ref(0);

const currentLoadedAudio = computed(
  () => loadedAudios.value[currentLoadedAudioIndex.value] ?? { windowId: null, file: null },
);
const currentLoadedAudioUrl = computed(() => currentLoadedAudio.value.audioUrl);
const currentLoadedAudioIsPlaying = computed(() => currentLoadedAudio.value.isPlaying);

const audioObject = ref<HTMLAudioElement | null>(null);
const audioDuration = ref(0);
const audioCurrentTime = ref(0);
const audioLoop = ref(false);

onMounted(() => {
  audioObject.value = new Audio();
  audioObject.value.loop = audioLoop.value;
  audioObject.value.addEventListener('loadedmetadata', updateAudioDuration);
  audioObject.value.addEventListener('timeupdate', onTimeUpdate);
  audioObject.value.addEventListener('ended', onAudioEnded);
});

onUnmounted(() => {
  if (audioObject.value) {
    audioObject.value.removeEventListener('loadedmetadata', updateAudioDuration);
    audioObject.value.removeEventListener('timeupdate', onTimeUpdate);
    audioObject.value.removeEventListener('ended', onAudioEnded);
    audioObject.value.src = '';

    audioObject.value = null;

    audioPlayerStore.removeAudioElement(windowId);
  }

  for (const loadedAudio of loadedAudios.value) {
    if (loadedAudio.audioUrl) {
      URL.revokeObjectURL(loadedAudio.audioUrl);
    }
  }
});

const fileExplorerWindowId = ref<string>();
watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (newReturnValue) => {
    const selectedReturnValue = newReturnValue.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!selectedReturnValue) return;

    // If it is of type 'object' then it should be a FileItem
    if (typeof selectedReturnValue.value === 'object' && selectedReturnValue.value.rawFile) {
      if (!fileExplorerWindowId.value) return;

      const audioUrl = URL.createObjectURL(selectedReturnValue.value.rawFile);
      loadedAudios.value.push({
        windowId: windowId,
        file: selectedReturnValue.value.rawFile,
        audioUrl: audioUrl,
        fileId: selectedReturnValue.fileId,
        isPlaying: false,
      });

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
    }
  },
);

watch(
  () => audioPlayerStore.loadedAudio,
  (newAudio) => {
    if (newAudio.windowId !== windowId) return;
    if (newAudio.audioUrl) return;

    currentLoadedAudioIndex.value = loadedAudios.value.push(newAudio) - 1;

    if (newAudio.file) {
      const audioUrl = URL.createObjectURL(newAudio.file);

      audioPlayerStore.loadedAudio = { ...newAudio, audioUrl };
      currentLoadedAudio.value.audioUrl = audioUrl;

      if (audioObject.value) {
        audioObject.value.src = audioUrl;
      }
    }
  },
  { deep: true, immediate: true },
);

const audioElementRef = ref();
watch(
  [audioElementRef, currentLoadedAudioUrl],
  () => {
    if (audioElementRef.value instanceof HTMLAudioElement && currentLoadedAudio.value.file) {
      audioPlayerStore.setAudioElement(
        windowId,
        audioElementRef.value,
        currentLoadedAudio.value.file,
      );
    }
  },
  { immediate: true },
);

watch(audioLoop, (newValue, oldValue) => {
  if (newValue === oldValue) return;
  if (!audioObject.value) return;

  audioObject.value.loop = newValue;
});

function handleSelectAudio() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, nextFileExplorerId, [
    'audio/mpeg',
  ]);

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

function updateAudioDuration() {
  audioDuration.value = audioObject.value?.duration ?? 0;
}

function onTimeUpdate() {
  audioCurrentTime.value = audioObject.value?.currentTime ?? 0;

  if (Math.floor(audioDuration.value) === Math.floor(audioCurrentTime.value) && audioObject.value) {
    if (audioLoop.value) {
      audioCurrentTime.value = 0;
      audioObject.value.currentTime = 0;
    }
    return;
  }
}

function onAudioEnded() {
  if (loadedAudios.value.length === 1 && audioObject.value) {
    audioCurrentTime.value = 0;
    audioObject.value.currentTime = 0;
    audioObject.value.play();
    return;
  }

  if (currentLoadedAudioIndex.value === loadedAudios.value.length - 1) {
    currentLoadedAudioIndex.value = 0;
  } else {
    currentLoadedAudioIndex.value++;
  }

  playAudio(currentLoadedAudioIndex.value);
}

function playAudio(audioIndex?: number) {
  if (audioObject.value === null) return;

  if (
    audioIndex !== undefined &&
    audioObject.value.src !== loadedAudios.value[audioIndex].audioUrl
  ) {
    currentLoadedAudioIndex.value = audioIndex;
    audioObject.value.src = currentLoadedAudio.value.audioUrl ?? '';

    for (const loadedAudio of loadedAudios.value) {
      if (loadedAudio === currentLoadedAudio.value) continue;
      loadedAudio.isPlaying = false;
    }
  } else if (!audioObject.value.src) {
    audioObject.value.src = currentLoadedAudioUrl.value ?? '';
  }

  if (audioObject.value) {
    const audioIsLoaded = audioObject.value.readyState >= 2;

    if (!audioIsLoaded) {
      audioObject.value.addEventListener(
        'canplaythrough',
        () => {
          if (audioObject.value) {
            audioObject.value.play();
            currentLoadedAudio.value.isPlaying = true;
          }
        },
        { once: true },
      );
    } else {
      audioObject.value.play();
      currentLoadedAudio.value.isPlaying = true;
    }
  }
}

function pauseAudio() {
  if (audioObject.value === null) return;

  audioObject.value.pause();

  currentLoadedAudio.value.isPlaying = false;
}

function onSliderInput(time: number) {
  if (audioObject.value) audioObject.value.currentTime = time;
}

function removeAudioFromList(index: number) {
  const audio = loadedAudios.value[index];
  if (currentLoadedAudio.value.audioUrl === audio.audioUrl) {
    if (currentLoadedAudio.value.audioUrl) {
      URL.revokeObjectURL(currentLoadedAudio.value.audioUrl);
    }
  }

  if (audioObject.value && audioObject.value.src === audio.audioUrl) {
    audioObject.value.src = '';
  }

  loadedAudios.value.splice(index, 1);
}

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const playlistName = ref('');
async function savePlaylist(updatedPlaylistName: string) {
  const trimmedPlaylistName = updatedPlaylistName.trim();
  if (!updatedPlaylistName || trimmedPlaylistName === '') return;

  if (loadedAudios.value.length === 0) return;
  const IDBAudioIds = loadedAudios.value.map((loadedAudios) => loadedAudios.fileId);

  playlistName.value = trimmedPlaylistName;

  const idbObject: PlaylistInsert = { name: playlistName.value, audios: IDBAudioIds };
  await rayDb.insertOne('playlists', idbObject);
}
</script>
<template>
  <div class="audio-player">
    <AudioPlayerHeader :_playlist-name="playlistName" @save-playlist="savePlaylist" />
    <div class="content">
      <button class="add-audio-button" @click="handleSelectAudio">Add audio to list</button>
      <ul>
        <AudioPlayerListItem
          v-for="(loadedAudio, index) in loadedAudios"
          :key="loadedAudio.audioUrl"
          :file-name="loadedAudio.file?.name ?? ''"
          :is-playing="loadedAudio.isPlaying ?? false"
          @play-pause-audio="loadedAudios[index].isPlaying ? pauseAudio() : playAudio(index)"
          @remove-audio-from-list="removeAudioFromList(index)"
        />
      </ul>
    </div>
    <AudioPlayerFooter
      :file-name="currentLoadedAudio.file?.name ?? ''"
      :audio-duration="audioDuration"
      :audio-current-time="audioCurrentTime"
      :is-playing="currentLoadedAudioIsPlaying ?? false"
      :looped="audioLoop"
      @play-pause-audio="currentLoadedAudioIsPlaying ? pauseAudio() : playAudio()"
      @slider-input="onSliderInput"
      @loop-audio="audioLoop = !audioLoop"
    />
  </div>
</template>
<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;

  --audio-player-header-height: 50px;
  --audio-player-header-column-height: 95px;
  --audio-player-footer-height: 80px;
  color: var(--text-color);

  container: audioPlayer / size;
  overflow: hidden;
}

.top-section {
  display: flex;
  align-items: start;
  width: 100%;
}

.content {
  display: flex;
  gap: 5px;
  flex-direction: column;
  align-items: center;
  height: calc(100% - var(--audio-player-footer-height) - var(--audio-player-header-height));
  background: rgba(0, 0, 0, 0.5);
  width: 50%;
  padding: 10px;
}

.content ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
  overflow: auto;
}

.content button {
  font-size: var(--font-size-lg);
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  color: var(--text-color);
  padding-block: 5px;
  padding-inline: 10px;
}

.back-button {
  height: 30px;
  padding-inline: 10px;
}

.add-audio-button {
  width: 100%;
  height: 50px;
  min-height: 50px;
}

@container (max-width: 1370px) {
  .content {
    width: 95%;
  }
}

@container audioPlayer (max-width: 550px) {
  .content {
    height: calc(
      100% - var(--audio-player-footer-height) - var(--audio-player-header-column-height)
    );
  }
}
</style>
