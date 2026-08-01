<script setup lang="ts">
import wallpapersJSON from '@/json/wallpapers.json';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';
import type { CustomWallpaperId, PredefinedWallpaperId } from '@/types/wallpaperTypes.js';
import { onBeforeMount, ref } from 'vue';
import {
  useDataUrlToFile,
  useGenerateImageThumbnail,
} from '@/composables/helpers/useCompressImage.ts';
const wallpapers: Record<string, string> = wallpapersJSON;

const { wallpaperId, selected, file } = defineProps<{
  wallpaperId: PredefinedWallpaperId | CustomWallpaperId;
  selected: boolean;
  file?: File;
}>();

const wallpaperImageName = wallpapers[`wallpaper-${wallpaperId}`];

const initialized = ref(false);
const imageUrl = ref();
onBeforeMount(async () => {
  if (!file) {
    const standardWpFile = await useDataUrlToFile(
      useWallpaperStore().getWallpaperUrl(wallpaperImageName),
      wallpaperImageName,
    );
    const compressedWpFile = await useGenerateImageThumbnail(standardWpFile);
    imageUrl.value = useWallpaperStore().getWallpaperUrlByFile(compressedWpFile);
    initialized.value = true;
    return;
  }
  const compressedFile = await useGenerateImageThumbnail(file);
  imageUrl.value = useWallpaperStore().getWallpaperUrlByFile(compressedFile);
  initialized.value = true;
});
</script>

<template>
  <div :class="{ selected }" class="wallpaper-tile">
    <img
      v-if="initialized"
      :src="imageUrl"
      :alt="file ? file.name : wallpaperImageName"
      loading="lazy"
      draggable="false"
    />
    <div v-else class="skeleton"></div>
  </div>
</template>
<style scoped>
.wallpaper-tile {
  width: 240px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.wallpaper-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.skeleton {
  background-color: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
}

.wallpaper-tile.selected {
  border: var(--accent-color) 4px solid;
}
</style>
