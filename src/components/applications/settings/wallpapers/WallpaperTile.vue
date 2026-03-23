<script setup lang="ts">
import wallpapersJSON from '@/json/wallpapers.json';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';
import type { CustomWallpaperId, PredefinedWallpaperId } from '@/types/WallpaperTypes.ts';
const wallpapers: Record<string, string> = wallpapersJSON;

const { wallpaperId, selected, file } = defineProps<{
  wallpaperId: PredefinedWallpaperId | CustomWallpaperId;
  selected: boolean;
  file?: File;
}>();

const wallpaperImageName = wallpapers[`wallpaper-${wallpaperId}`];

const imageUrl = file
  ? useWallpaperStore().getWallpaperUrlByFile(file)
  : new URL(useWallpaperStore().getWallpaperUrl(wallpaperImageName), import.meta.url).href;
</script>

<template>
  <div :class="{ selected }" class="wallpaper-tile">
    <img :src="imageUrl" :alt="file ? file.name : wallpaperImageName" loading="lazy" />
  </div>
</template>
<style scoped>
.wallpaper-tile {
  width: 240px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.wallpaper-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.wallpaper-tile.selected {
  border: var(--accent-color) 4px solid;
}
</style>
