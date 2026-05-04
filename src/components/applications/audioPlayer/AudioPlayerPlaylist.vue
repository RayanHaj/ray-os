<script setup lang="ts">
import { type FileItem, isAudioType, type Item } from '@/types/ItemTypes.ts';
import type { Playlist } from '@/types/AudioPlayerTypes.ts';
import { onBeforeMount, ref, type Ref } from 'vue';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

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
    <div>{{ playlist.name }}</div>
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
  width: 250px;
  height: 250px;
  background: var(--highlight-color);
  padding: 10px;
  border-radius: 5px;
}
</style>
