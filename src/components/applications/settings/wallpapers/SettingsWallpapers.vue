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

function onClickDeselectWallpaper() {
  wallpaperStore.deselectWallpaper();
}
</script>

<template>
  <div class="settings-wallpapers">
    <div class="top-bar">
      <button @click="onClickDeselectWallpaper()">deselect wallpaper</button>
      <button>upload wallpaper</button>
    </div>
    <hr />
    <div class="custom-wallpapers">
      <h2>Custom wallpapers</h2>
      <span>No uploaded wallpapers found</span>
    </div>
    <hr />
    <div class="pre-defined-wallpapers">
      <h2>Standard wallpapers</h2>
      <div class="pre-defined-wallpapers-list">
        <WallpaperTile
          v-for="index in WALLPAPER_COUNT"
          :key="index"
          :wallpaper-id="index"
          :selected="index === wallpaperStore.selectedWallpaper"
          @click="onClick(index)"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.top-bar {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: start;
  gap: 10px;
}

.settings-wallpapers {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 5px;
}

.custom-wallpapers {
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  min-height: 200px;
  position: relative;
}

.custom-wallpapers span {
  color: var(--text-secondary-color);
  font-size: var(--font-size-sm);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pre-defined-wallpapers {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.pre-defined-wallpapers-list {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

hr {
  width: 100%;
  border: var(--window-border-color) solid 2px;
  border-radius: 5px;
}
</style>
