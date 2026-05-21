<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';
import type {
  AudioPlayerPages,
  LoadedAudio,
  Playlist,
  PlaylistInsert,
} from '@/types/AudioPlayerTypes.ts';
import AudioPlayerListItem from '@/components/applications/audioPlayer/AudioPlayerListItem.vue';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import AudioPlayerHeader from '@/components/applications/audioPlayer/AudioPlayerHeader.vue';
import type { RayDb } from 'ray-db-wrapper';
import AudioPlayerPlaylistListItem from '@/components/applications/audioPlayer/AudioPlayerPlaylistListItem.vue';
import { isAudioType, type Item } from '@/types/ItemTypes.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useSetLoadedPlaylists } from '@/composables/audioPlayer/useSetLoadedPlaylists.ts';
import {
  setCurrentLoadedAudioByUrl,
  useAddNewAudio,
} from '@/composables/audioPlayer/useAddNewAudio.ts';
import {
  updateAudioDuration,
  updateAudioTime,
} from '@/composables/audioPlayer/useUpdateAudioValues.ts';

const audioPlayerStore = useAudioPlayerStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const currentPage = ref<AudioPlayerPages>('playlists');

const loadedAudios = ref<LoadedAudio[]>([]);
const currentLoadedAudio = ref<LoadedAudio>();

const loadedPlaylists = ref<Playlist[]>([]);
const currentLoadedPlaylist = ref<Playlist>();

const audioObject = ref<HTMLAudioElement | null>(null);
const audioDuration = ref(0);
const audioCurrentTime = ref(0);
const audioLoop = ref(false);

function revokeObjectURLS() {
  for (const loadedAudio of loadedAudios.value) {
    if (loadedAudio.audioUrl) {
      URL.revokeObjectURL(loadedAudio.audioUrl);
    }
  }
}

const onLoadedMetadata = () => updateAudioDuration(audioDuration, audioObject);
const onTimeUpdate = () => updateAudioTime(audioDuration, audioObject, audioCurrentTime, audioLoop);

onMounted(() => {
  audioObject.value = new Audio();
  audioObject.value.loop = audioLoop.value;
  audioObject.value.addEventListener('loadedmetadata', onLoadedMetadata);
  audioObject.value.addEventListener('timeupdate', onTimeUpdate);
  audioObject.value.addEventListener('ended', onAudioEnded);
});

onUnmounted(() => {
  if (audioObject.value) {
    audioObject.value.removeEventListener('loadedmetadata', onLoadedMetadata);
    audioObject.value.removeEventListener('timeupdate', onTimeUpdate);
    audioObject.value.removeEventListener('ended', onAudioEnded);
    audioObject.value.src = '';

    audioObject.value = null;
  }

  audioPlayerStore.resetLoadedAudio();

  revokeObjectURLS();
});

watch(
  currentPage,
  async (newPage, oldPage) => {
    if (newPage === 'playlist' || newPage === oldPage) return;
    await useSetLoadedPlaylists(rayDb, loadedPlaylists, currentLoadedPlaylist);
  },
  { immediate: true },
);

watch(
  () => audioPlayerStore.loadedAudio,
  async (newAudio) => {
    if (newAudio.windowId !== windowId || newAudio.audioUrl || !newAudio.file) return;

    useAddNewAudio(audioObject, loadedAudios, currentLoadedAudio, newAudio, windowId, {
      load: true,
    });

    await nextTick();

    currentPage.value = 'playlist';
    playAudio();
  },
  { deep: true, immediate: true },
);

const fileExplorerWindowId = ref<string>();
watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (returnValues) => {
    const returnValue = returnValues.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!returnValue) return;

    // If it is of type 'object' then it should be a FileItem
    if (typeof returnValue.value === 'object' && returnValue.value.rawFile) {
      if (!fileExplorerWindowId.value) return;

      const newAudio: LoadedAudio = {
        windowId: windowId,
        file: returnValue.value.rawFile,
        fileId: returnValue.fileId,
        isPlaying: false,
        playlistName: currentLoadedPlaylist.value?.name ?? '',
      };

      useAddNewAudio(audioObject, loadedAudios, currentLoadedAudio, newAudio, windowId);

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
    }
  },
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

async function onAudioEnded() {
  if (loadedAudios.value.length === 1 && audioObject.value) {
    audioCurrentTime.value = 0;
    audioObject.value.currentTime = 0;
    await audioObject.value.play();
    return;
  }

  const currentLoadedAudioIndex = loadedAudios.value.findIndex(
    (audio) => audio.audioUrl === currentLoadedAudio.value?.audioUrl,
  );

  const nextAudio = loadedAudios.value[currentLoadedAudioIndex + 1];

  if (nextAudio === undefined) {
    playAudio(loadedAudios.value[0].audioUrl);
    return;
  }

  playAudio(nextAudio.audioUrl);
}

function playAudio(audioUrl?: string) {
  if (audioObject.value === null) return;

  if (audioUrl !== undefined) {
    setCurrentLoadedAudioByUrl(audioUrl, audioObject, loadedAudios, currentLoadedAudio);

    for (const loadedAudio of loadedAudios.value) {
      if (loadedAudio.audioUrl === audioUrl) continue;
      loadedAudio.isPlaying = false;
    }
  } else if (!audioObject.value.src) {
    audioObject.value.src = currentLoadedAudio.value?.audioUrl ?? '';
  }

  if (audioObject.value) {
    const audioIsLoaded = audioObject.value.readyState >= 2;

    if (!currentLoadedAudio.value) {
      currentLoadedAudio.value = loadedAudios.value.find((audio) => audio.audioUrl === audioUrl);
    }

    const currentLoadedAudioIndex = loadedAudios.value.findIndex(
      (audio) => audio.audioUrl === currentLoadedAudio.value?.audioUrl,
    );

    if (!audioIsLoaded) {
      audioObject.value.addEventListener(
        'canplaythrough',
        () => {
          if (audioObject.value && currentLoadedAudio.value) {
            audioObject.value.play();
            currentLoadedAudio.value.isPlaying = true;

            if (currentLoadedAudioIndex === -1) return;
            loadedAudios.value[currentLoadedAudioIndex].isPlaying = true;
          }
        },
        { once: true },
      );
    } else {
      if (currentLoadedAudio.value) {
        audioObject.value.play();
        currentLoadedAudio.value.isPlaying = true;

        if (currentLoadedAudioIndex === -1) return;
        loadedAudios.value[currentLoadedAudioIndex].isPlaying = true;
      }
    }
  }
}

function pauseAudio() {
  if (audioObject.value === null) return;

  if (!currentLoadedAudio.value || currentLoadedAudio.value.audioUrl !== audioObject.value.src)
    return;

  const currentLoadedAudioIndex = loadedAudios.value.findIndex(
    (audio) => audio.audioUrl === currentLoadedAudio.value?.audioUrl,
  );

  audioObject.value.pause();
  currentLoadedAudio.value.isPlaying = false;

  if (currentLoadedAudioIndex === -1) return;
  loadedAudios.value[currentLoadedAudioIndex].isPlaying = false;
}

function onSliderInput(time: number) {
  if (audioObject.value) audioObject.value.currentTime = time;
}

function removeAudioFromList(index: number) {
  const audio = loadedAudios.value[index];

  if (
    currentLoadedAudio.value &&
    currentLoadedAudio.value.audioUrl &&
    currentLoadedAudio.value.audioUrl === audio.audioUrl
  ) {
    URL.revokeObjectURL(currentLoadedAudio.value.audioUrl);
  }

  if (audioObject.value && audioObject.value.src === audio.audioUrl) {
    audioObject.value.src = '';
  }

  loadedAudios.value.splice(index, 1);
}

async function savePlaylist(updatedPlaylistName: string) {
  try {
    const trimmedPlaylistName = updatedPlaylistName.trim();
    if (!updatedPlaylistName || trimmedPlaylistName === '') {
      useToastStore().createToast('enter a playlist name', 'warning', 2500, 'window', windowId);
      return;
    }

    const IDBAudioIds = loadedAudios.value.map((loadedAudios) => loadedAudios.fileId);
    if (!currentLoadedPlaylist.value) {
      const playlistInsert: PlaylistInsert = { name: trimmedPlaylistName, audios: IDBAudioIds };
      await rayDb.insertOne('playlists', playlistInsert);
      return;
    }

    currentLoadedPlaylist.value.name = trimmedPlaylistName;
    currentLoadedPlaylist.value.audios = IDBAudioIds;

    const foundPlaylist = await rayDb.findOne<Playlist>(
      'playlists',
      'id',
      currentLoadedPlaylist.value.id,
    );
    const updatedPlaylist = {
      ...currentLoadedPlaylist.value,
      audios: [...currentLoadedPlaylist.value.audios],
    };

    if (JSON.stringify(foundPlaylist) === JSON.stringify(updatedPlaylist)) {
      useToastStore().createToast('No changes made', 'warning', 2500, 'window', windowId);
      return;
    }

    await rayDb.updateOne<Playlist>('playlists', updatedPlaylist);

    useToastStore().createToast('Playlist saved successfully', 'success', 1000, 'window', windowId);
  } catch (e) {
    useToastStore().createToast(
      'Could not save playlist, try again',
      'error',
      5000,
      'window',
      windowId,
    );
  }
}

async function openPlaylist(playlist: Playlist) {
  if (playlist.audios.length > 0) {
    const foundLoadedAudios: LoadedAudio[] = [];
    for (const fileId of playlist.audios) {
      const audio = await rayDb.findOne<Item>('files', 'id', fileId);
      if (!audio || audio.content.type !== 'file') continue;
      if (!isAudioType(audio.content.rawFile?.type)) continue;

      /**
       * FOR DEBUGGING
       */
      // console.log({
      //   currentLoadedAudio: currentLoadedAudio.value,
      //   isPlaying: currentLoadedAudio.value?.isPlaying,
      //   fileId: currentLoadedAudio.value?.fileId,
      //   matchesFileId: currentLoadedAudio.value?.fileId === fileId,
      //   playlistName: currentLoadedAudio.value?.playlistName,
      //   matchesPlaylist: currentLoadedAudio.value?.playlistName === playlist.name,
      // });

      const audioUrl =
        currentLoadedAudio.value &&
        currentLoadedAudio.value.isPlaying &&
        currentLoadedAudio.value.fileId === fileId &&
        currentLoadedAudio.value.playlistName === playlist.name
          ? currentLoadedAudio.value.audioUrl
          : URL.createObjectURL(audio.content.rawFile);

      foundLoadedAudios.push({
        windowId: windowId,
        file: audio.content.rawFile,
        audioUrl: audioUrl,
        fileId: audio.id,
        isPlaying:
          currentLoadedAudio.value &&
          currentLoadedAudio.value.isPlaying &&
          currentLoadedAudio.value.audioUrl === audioUrl,
        playlistName: playlist.name,
      });
    }

    loadedAudios.value = foundLoadedAudios;

    if (!currentLoadedAudio.value) {
      currentLoadedAudio.value = foundLoadedAudios[0];
    }
  }

  currentLoadedPlaylist.value = playlist;
  currentPage.value = 'playlist';
}

function onAddPlaylist() {
  loadedAudios.value = [];
  currentLoadedPlaylist.value = undefined;
  currentPage.value = 'playlist';
}
</script>
<template>
  <div class="audio-player">
    <AudioPlayerHeader
      :_playlist-name="currentLoadedPlaylist?.name ?? ''"
      :current-page="currentPage"
      @go-to-playlists="currentPage = 'playlists'"
      @save-playlist="savePlaylist"
    />
    <div class="content">
      <button v-if="currentPage === 'playlist'" class="add-audio-button" @click="handleSelectAudio">
        Add audio to list
      </button>
      <ul v-if="currentPage === 'playlist'">
        <AudioPlayerListItem
          v-for="(loadedAudio, index) in loadedAudios"
          :key="loadedAudio.audioUrl"
          :file-name="loadedAudio.file?.name ?? ''"
          :is-playing="loadedAudio.isPlaying ?? false"
          @play-pause-audio="
            loadedAudios[index].isPlaying ? pauseAudio() : playAudio(loadedAudio.audioUrl)
          "
          @remove-audio-from-list="removeAudioFromList(index)"
        />
      </ul>
      <button v-if="currentPage === 'playlists'" class="add-audio-button" @click="onAddPlaylist">
        Add playlist
      </button>
      <ul v-if="currentPage === 'playlists'">
        <AudioPlayerPlaylistListItem
          v-for="playlist in loadedPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          :is-playing="false"
          @open-playlist="openPlaylist(playlist)"
        />
      </ul>
    </div>
    <AudioPlayerFooter
      :file-name="currentLoadedAudio?.file?.name ?? ''"
      :audio-duration="audioDuration"
      :audio-current-time="audioCurrentTime"
      :is-playing="currentLoadedAudio?.isPlaying ?? false"
      :looped="audioLoop"
      @play-pause-audio="currentLoadedAudio?.isPlaying ? pauseAudio() : playAudio()"
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
