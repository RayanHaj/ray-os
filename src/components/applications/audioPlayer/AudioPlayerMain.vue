<script setup lang="ts">
import { computed, onMounted, onUnmounted, type Ref, ref, watch } from 'vue';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import AudioPlayerFooter from '@/components/applications/audioPlayer/AudioPlayerFooter.vue';
import type { LoadedAudio } from '@/types/AudioPlayerTypes.ts';
import AudioPlayerListItem from '@/components/applications/audioPlayer/AudioPlayerListItem.vue';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';

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

onMounted(() => {
  audioObject.value = new Audio();
  audioObject.value.loop = true;
  audioObject.value.addEventListener('loadedmetadata', updateAudioDuration);
  audioObject.value.addEventListener('timeupdate', onTimeUpdate);
});

onUnmounted(() => {
  if (audioObject.value) {
    audioObject.value.removeEventListener('loadedmetadata', updateAudioDuration);
    audioObject.value.removeEventListener('timeupdate', onTimeUpdate);
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
function handleSelectAudio() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, nextFileExplorerId, [
    'audio/mpeg',
  ]);

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

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
        windowId,
        file: selectedReturnValue.value.rawFile,
        audioUrl,
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

function updateAudioDuration() {
  audioDuration.value = audioObject.value?.duration ?? 0;
}

function onTimeUpdate() {
  if (Math.floor(audioDuration.value) === Math.floor(audioCurrentTime.value) && audioObject.value) {
    audioCurrentTime.value = 0;
    audioObject.value.currentTime = 0;
    return;
  }
  audioCurrentTime.value = audioObject.value?.currentTime ?? 0;
}

function playAudio(audioIndex?: number) {
  if (audioObject.value === null) return;

  if (audioIndex !== undefined) {
    currentLoadedAudioIndex.value = audioIndex;
    audioObject.value.src = currentLoadedAudio.value.audioUrl ?? '';

    for (const loadedAudio of loadedAudios.value) {
      if (loadedAudio === currentLoadedAudio.value) continue;
      loadedAudio.isPlaying = false;
    }
  } else if (!audioObject.value.src) {
    audioObject.value.src = currentLoadedAudioUrl.value ?? '';
  }

  audioObject.value.play();
  currentLoadedAudio.value.isPlaying = true;
}

function pauseAudio() {
  if (audioObject.value === null) return;

  audioObject.value.pause();

  currentLoadedAudio.value.isPlaying = false;
}

function onSliderInput(time: number) {
  if (audioObject.value) audioObject.value.currentTime = time;
}
</script>
<template>
  <div class="audio-player">
    <div class="content">
      <button @click="handleSelectAudio">Open audio or directory</button>
      <ul v-for="(loadedAudio, index) in loadedAudios" :key="loadedAudio.audioUrl">
        <AudioPlayerListItem
          v-if="loadedAudio.file"
          :file-name="loadedAudio.file.name"
          :is-playing="loadedAudio.isPlaying ?? false"
          @play-pause-audio="loadedAudios[index].isPlaying ? pauseAudio() : playAudio(index)"
        />
      </ul>
      {{ currentLoadedAudio.file ? '' : 'load audio through File Explorer' }}
    </div>
    <AudioPlayerFooter
      :file-name="currentLoadedAudio.file?.name ?? ''"
      :audio-duration="audioDuration"
      :audio-current-time="audioCurrentTime"
      :is-playing="currentLoadedAudioIsPlaying ?? false"
      @play-pause-audio="currentLoadedAudioIsPlaying ? pauseAudio() : playAudio()"
      @slider-input="onSliderInput"
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
  --audio-player-footer-height: 80px;
  color: var(--text-color);

  container: audioPlayer / size;
}

.content {
  display: flex;
  gap: 5px;
  flex-direction: column;
  align-items: center;
  height: calc(100% - var(--audio-player-header-height));
  background: rgba(0, 0, 0, 0.5);
  margin: 5px;
  border-radius: 5px;
  width: 50%;
  padding: 10px;
}

.content ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
}

@container (max-width: 900px) {
  .content {
    width: 95%;
  }
}
</style>
