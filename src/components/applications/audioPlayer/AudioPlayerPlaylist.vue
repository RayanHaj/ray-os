<script setup lang="ts">
import { type FileItem, isAudioType, type Item } from '@/types/ItemTypes.ts';
import type { Playlist } from '@/types/AudioPlayerTypes.ts';
import { onBeforeMount, ref, type Ref } from 'vue';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const playSvg = useSvgOrFallback('Play');

const { playlist } = defineProps<{ playlist: Playlist }>();

const audioFileItems: Ref<FileItem[]> = ref([]);

onBeforeMount(async () => {
  const audioIds = playlist.audios;
  for (const audioId of audioIds) {
    const audio = await rayDb.findOne<Item>('files', 'id', audioId);

    if (!isValidAudioFile) return;

    audioFileItems.value.push(audio.content as FileItem);
  }
});

function isValidAudioFile(item: Item): item is Item & { content: FileItem & { rawFile: File } } {
  return (
    item &&
    item.content.type === 'file' &&
    !!item.content.rawFile &&
    isAudioType(item.content.rawFile.type)
  );
}

// const validAudioFiles = computed(() => audioFileInputs.filter(isValidAudioFile));
</script>
<template>
  <div class="audio-player-playlist">
    <div class="playlist-name">{{ playlist.name }}</div>
    <div class="playlist-play">
      <button class="play-button">
        <component :is="playSvg.svg" custom-width="25" custom-height="25" />
      </button>
    </div>
    <div class="playlist-audio-count">
      {{
        `${audioFileItems.length} ${audioFileItems.length > 1 || audioFileItems.length === 0 ? 'audio files' : 'audio file'}`
      }}
    </div>

    <!--    <AudioPlayerPlaylistView-->
    <!--      v-for="(audioItem, i) in audioFileItems"-->
    <!--      :key="`${audioItem.name} ${i}`"-->
    <!--      :audio-file="audioItem.rawFile!"-->
    <!--    />-->
  </div>
</template>
<style scoped>
.audio-player-playlist {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 150px;
  height: 150px;
  background: var(--highlight-color);
  padding: 10px;
  border-radius: 5px;
}

.audio-player-playlist:hover {
  .playlist-play {
    visibility: visible;
  }
}

.playlist-audio-count {
  align-self: flex-end;
}

.playlist-play {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 5px;
  visibility: hidden;
}

.playlist-play button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 100%;
}
</style>
