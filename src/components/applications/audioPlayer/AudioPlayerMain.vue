<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';
import type { AudioPlayerPages, LoadedAudio, Playlist } from '@/types/AudioPlayerTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import AudioPlayerHeader from '@/components/applications/audioPlayer/AudioPlayerHeader.vue';
import type { RayDb } from 'ray-db-wrapper';
import { useSetLoadedPlaylists } from '@/composables/audioPlayer/useSetLoadedPlaylists.ts';
import { useAddNewAudio } from '@/composables/audioPlayer/useAddNewAudio.ts';
import {
  useUpdateAudioDuration,
  useUpdateAudioTime,
} from '@/composables/audioPlayer/useUpdateAudioValues.ts';
import { useOpenSelectAudioWindow } from '@/composables/audioPlayer/useSelectAudioFileWindow.ts';
import { usePauseAudio, usePlayAudio } from '@/composables/audioPlayer/useAudioPlayback.ts';
import {
  useDeletePlaylist,
  useOpenPlaylist,
  useSavePlaylist,
} from '@/composables/audioPlayer/usePlaylist.ts';
import AudioPlayerPlaylistView from '@/components/applications/audioPlayer/AudioPlayerPlaylistView.vue';
import AudioPlayerPlaylistsView from '@/components/applications/audioPlayer/AudioPlayerPlaylistsView.vue';

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

const onLoadedMetadata = () => useUpdateAudioDuration(audioDuration, audioObject);
const onTimeUpdate = () =>
  useUpdateAudioTime(audioDuration, audioObject, audioCurrentTime, audioLoop);

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
    await playAudio();
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

      useAddNewAudio(
        audioObject,
        loadedAudios,
        currentLoadedAudio,
        {
          windowId: windowId,
          file: returnValue.value.rawFile,
          fileId: returnValue.fileId,
          isPlaying: false,
          playlistName: currentLoadedPlaylist.value?.name ?? '',
        },
        windowId,
      );

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
    }
  },
);

watch(audioLoop, (newValue, oldValue) => {
  if (newValue === oldValue) return;
  if (!audioObject.value) return;

  audioObject.value.loop = newValue;
});

const onAddAudioButtonClicked = () => useOpenSelectAudioWindow(fileExplorerWindowId, windowId);

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
    await playAudio(loadedAudios.value[0].audioUrl);
    return;
  }

  await playAudio(nextAudio.audioUrl);
}

const playAudio = (audioUrl?: string) =>
  usePlayAudio(audioObject, loadedAudios, currentLoadedAudio, audioUrl);
const pauseAudio = () => usePauseAudio(audioObject, loadedAudios, currentLoadedAudio);

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

const savePlaylist = (updatedPlaylistName: string) =>
  useSavePlaylist(updatedPlaylistName, loadedAudios, currentLoadedPlaylist, windowId, rayDb);

const openPlaylist = (playlist: Playlist) =>
  useOpenPlaylist(
    playlist,
    currentLoadedPlaylist,
    currentPage,
    loadedAudios,
    currentLoadedAudio,
    windowId,
    rayDb,
  );

const deletePlaylist = (id: number) =>
  useDeletePlaylist(id, loadedPlaylists, currentLoadedPlaylist, rayDb, windowId);

function createEmptyPlaylist() {
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
      <AudioPlayerPlaylistsView
        v-if="currentPage === 'playlists'"
        :loaded-playlists="loadedPlaylists"
        @on-create-new-playlist-clicked="createEmptyPlaylist"
        @on-open-playlist="openPlaylist"
        @on-delete-playlist="deletePlaylist"
      />
      <AudioPlayerPlaylistView
        v-if="currentPage === 'playlist'"
        :loaded-audios="loadedAudios"
        @add-audio-button-clicked="onAddAudioButtonClicked"
        @on-remove-audio="(index) => removeAudioFromList(index)"
        @on-play-pause-audio="
          (isPlaying, audioUrl) => (isPlaying ? pauseAudio() : playAudio(audioUrl))
        "
      />
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
