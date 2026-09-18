<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import MediaPlayerFooter from '@/components/applications/mediaPlayers/MediaPlayerFooter.vue';
import type { AudioPlayerPages, LoadedAudio, Playlist } from '@/types/audioPlayerTypes.js';
import AudioPlayerHeader from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerHeader.vue';
import type { RayDb } from 'ray-db-wrapper';
import { useSetLoadedPlaylists } from '@/composables/audioPlayer/useSetLoadedPlaylists.ts';
import { useAddNewAudio } from '@/composables/audioPlayer/useAddNewAudio.ts';
import {
  useUpdateAudioDuration,
  useUpdateAudioTime,
} from '@/composables/audioPlayer/useUpdateAudioValues.ts';
import { usePauseAudio, usePlayAudio } from '@/composables/audioPlayer/useAudioPlayback.ts';
import {
  useIsPlaylistUpdated,
  useDeletePlaylist,
  useOpenPlaylist,
  useSavePlaylist,
} from '@/composables/audioPlayer/usePlaylist.ts';
import AudioPlayerPlaylistView from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerPlaylistView.vue';
import AudioPlayerPlaylistsView from '@/components/applications/mediaPlayers/audioPlayer/AudioPlayerPlaylistsView.vue';
import { useAudioSelectManager } from '@/composables/audioPlayer/useAudioSelectManager.ts';
import { createConfirmDialog } from '@/composables/confirmDialog/createConfirmDialog.ts';

const audioPlayerStore = useAudioPlayerStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const currentPage = ref<AudioPlayerPages>('playlists');

const initialLoadedAudios = ref<LoadedAudio[]>([]);
const loadedAudios = ref<LoadedAudio[]>([]);

const currentLoadedAudioUrl = ref<string | undefined>();

const currentLoadedAudio = computed(() => {
  return {
    audio: loadedAudios.value.find((audio) => audio.audioUrl === currentLoadedAudioUrl.value),
    index: loadedAudios.value.findIndex((audio) => audio.audioUrl === currentLoadedAudioUrl.value),
  };
});

const loadedPlaylists = ref<Playlist[]>([]);
const currentLoadedPlaylistId = ref<number>();

const currentLoadedPlaylist = computed<{ playlist?: Playlist; index?: number }>(() => {
  return {
    playlist: loadedPlaylists.value.find(
      (playlist) => playlist.id === currentLoadedPlaylistId.value,
    ),
    index:
      loadedPlaylists.value.findIndex(
        (playlist) => playlist.id === currentLoadedPlaylistId.value,
      ) ?? undefined,
  };
});

const audioObject = ref<HTMLAudioElement | null>(null);
const audioDuration = ref(0);
const audioCurrentTime = ref(0);
const audioLoop = ref(false);
const audioShuffle = ref(false);

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

onUnmounted(async () => {
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
    await useSetLoadedPlaylists(rayDb, loadedPlaylists, currentLoadedPlaylistId);
  },
  { immediate: true },
);

watch(
  () => audioPlayerStore.loadedAudio,
  async (newAudio) => {
    if (newAudio.windowId !== windowId || newAudio.audioUrl || !newAudio.file) return;

    useAddNewAudio(audioObject, loadedAudios, currentLoadedAudioUrl, newAudio, windowId, {
      loadAudio: true,
    });

    await nextTick();

    currentPage.value = 'playlist';
    await playAudio();
  },
  { immediate: true },
);

watch(audioLoop, (newValue, oldValue) => {
  if (newValue === oldValue) return;
  if (!audioObject.value) return;

  audioObject.value.loop = newValue;
});

const audioSelectManager = useAudioSelectManager(
  audioObject,
  loadedAudios,
  currentLoadedAudioUrl,
  currentLoadedPlaylist.value.playlist?.name ?? '',
  windowId,
);

const onAddAudioButtonClicked = () => audioSelectManager.openSelectAudioWindow(windowId);

async function onAudioEnded() {
  const nextAudio: LoadedAudio = audioShuffle.value
    ? getShuffledAudio()
    : loadedAudios.value[currentLoadedAudio.value.index + 1];

  if (nextAudio === undefined) {
    await playAudio(loadedAudios.value[0].audioUrl);
    return;
  }

  await playAudio(nextAudio.audioUrl);
}

const playAudio = async (audioUrl?: string) =>
  await usePlayAudio(audioObject, loadedAudios, currentLoadedAudioUrl, audioUrl);

const pauseAudio = () => usePauseAudio(audioObject, loadedAudios, currentLoadedAudioUrl);

function onSliderInput(time: number) {
  if (audioObject.value) audioObject.value.currentTime = time;
}

function removeAudioFromList(index: number) {
  const audio = loadedAudios.value[index];

  if (currentLoadedAudioUrl.value === audio.audioUrl) {
    if (!currentLoadedAudioUrl.value) return;
    URL.revokeObjectURL(currentLoadedAudioUrl.value);
  }

  if (audioObject.value && audioObject.value.src === audio.audioUrl) {
    audioObject.value.src = '';
  }

  loadedAudios.value.splice(index, 1);
}

const savePlaylist = (updatedPlaylistName: string) =>
  useSavePlaylist(
    updatedPlaylistName,
    loadedAudios,
    currentLoadedPlaylist.value.playlist,
    windowId,
    rayDb,
  );

const openPlaylist = async (playlist: Playlist) => {
  const { audios } = await useOpenPlaylist(
    playlist,
    currentLoadedPlaylistId,
    currentPage,
    loadedAudios,
    currentLoadedAudioUrl,
    audioObject,
    windowId,
    rayDb,
  );

  initialLoadedAudios.value = audios;
};

const deletePlaylist = (id: number) =>
  useDeletePlaylist(id, loadedPlaylists, currentLoadedPlaylistId, rayDb, windowId);

function createEmptyPlaylist() {
  loadedAudios.value = [];
  currentLoadedPlaylistId.value = undefined;

  if (audioPlayerHeaderRef.value) {
    audioPlayerHeaderRef.value.playlistName = '';
  }

  currentPage.value = 'playlist';
}

async function onPrevious() {
  if (audioObject.value === null) return;

  const currentIndex = currentLoadedAudio.value.index;
  if (currentIndex === 0) {
    audioObject.value.currentTime = 0;
    return;
  }

  if (audioObject.value.currentTime > 3) {
    audioObject.value.currentTime = 0;
  } else {
    currentLoadedAudioUrl.value = loadedAudios.value[currentIndex - 1].audioUrl;
    await playAudio(currentLoadedAudioUrl.value);
  }
}

async function onNext() {
  if (audioObject.value === null) return;

  const currentIndex = currentLoadedAudio.value.index;
  currentLoadedAudioUrl.value = audioShuffle.value
    ? getShuffledAudio().audioUrl
    : loadedAudios.value[currentIndex === loadedAudios.value.length - 1 ? 0 : currentIndex + 1]
        .audioUrl;
  await playAudio(currentLoadedAudioUrl.value);
}

function toggleAudioOption(option: 'loop' | 'shuffle') {
  switch (option) {
    case 'loop':
      audioLoop.value = !audioLoop.value;
      if (audioLoop.value) audioShuffle.value = false;
      break;
    case 'shuffle':
      audioShuffle.value = !audioShuffle.value;
      if (audioShuffle.value) audioLoop.value = false;
      break;
  }
}

function getShuffledAudio(): LoadedAudio {
  const currentIndex = currentLoadedAudio.value.index;

  let nextAudioIndex = Math.floor(Math.random() * loadedAudios.value.length);
  while (currentIndex === nextAudioIndex) {
    nextAudioIndex = Math.floor(Math.random() * loadedAudios.value.length);
  }

  return loadedAudios.value[nextAudioIndex];
}

const audioPlayerHeaderRef = useTemplateRef('audioPlayerHeaderRef');
defineExpose({
  onWindowClose: async (left: string, top: string) => {
    if (!audioPlayerHeaderRef.value) return true;
    if (!currentLoadedPlaylist.value.playlist) return true;

    const playlistUpdated = await useIsPlaylistUpdated(
      rayDb,
      currentLoadedPlaylist.value.playlist,
      loadedAudios.value,
      audioPlayerHeaderRef.value.playlistName,
    );

    if (!playlistUpdated) {
      return true;
    } else {
      const result = await createConfirmDialog(
        'Unsaved changes will be lost. Continue?',
        left,
        top,
      );
      return result ?? false;
    }
  },
});
</script>
<template>
  <div class="audio-player">
    <AudioPlayerHeader
      :loaded-playlist="currentLoadedPlaylist"
      :current-page="currentPage"
      @go-to-playlists="currentPage = 'playlists'"
      @save-playlist="savePlaylist"
      ref="audioPlayerHeaderRef"
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
        :current-loaded-audio-url="currentLoadedAudioUrl"
        @add-audio-button-clicked="onAddAudioButtonClicked"
        @on-remove-audio="(index) => removeAudioFromList(index)"
        @on-play-pause-audio="
          (isPlaying, audioUrl) => (isPlaying ? pauseAudio() : playAudio(audioUrl))
        "
      />
    </div>
    <MediaPlayerFooter
      :file-name="currentLoadedAudio.audio?.file?.name ?? ''"
      :audio-duration="audioDuration"
      :audio-current-time="audioCurrentTime"
      :is-playing="currentLoadedAudio.audio?.isPlaying ?? false"
      :looped="audioLoop"
      :shuffled="audioShuffle"
      :disabled="!currentLoadedAudioUrl"
      :options="{ nextAndPrevious: true, shuffle: true }"
      @play-pause-audio="currentLoadedAudio.audio?.isPlaying ? pauseAudio() : playAudio()"
      @slider-input="onSliderInput"
      @loop-audio="toggleAudioOption('loop')"
      @shuffle-audio="toggleAudioOption('shuffle')"
      @previous="onPrevious"
      @next="onNext"
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
