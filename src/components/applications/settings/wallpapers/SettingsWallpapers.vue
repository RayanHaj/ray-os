<script setup lang="ts">
import WallpaperTile from '@/components/applications/settings/wallpapers/WallpaperTile.vue';
import wallpapers from '@/json/wallpapers.json';
import { onBeforeMount } from 'vue';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';

const WALLPAPER_COUNT = Object.keys(wallpapers).length;
const wallpaperStore = useWallpaperStore();

onBeforeMount(() => wallpaperStore.initSelectedWallpaper());

function onClick(index: number) {
  wallpaperStore.setSelectedWallpaper(index);
}
</script>

<template>
  <div class="settings-wallpapers">
    <WallpaperTile
      v-for="index in WALLPAPER_COUNT"
      :key="index"
      :wallpaper-id="index"
      :selected="index === wallpaperStore.selectedWallpaper"
      @click="onClick(index)"
    />
  </div>
</template>
<style scoped>
.settings-wallpapers {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
