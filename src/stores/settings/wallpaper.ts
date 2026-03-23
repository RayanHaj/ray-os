import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import type { CustomWallpaperId, PredefinedWallpaperId } from '@/types/WallpaperTypes.ts';

export const useWallpaperStore = defineStore('wallpaper', () => {
  const selectedWallpaper: Ref<PredefinedWallpaperId | CustomWallpaperId | null> = ref(null);
  const SELECTED_WALLPAPER_LS_KEY = 'selectedWallpaper';

  function getWallpaperUrl(wallpaperName: string) {
    return `../../../../assets/wallpaperThumbnails/${wallpaperName}`;
  }

  function getWallpaperUrlByFile(imageFile: File) {
    return URL.createObjectURL(imageFile);
  }

  function initSelectedWallpaper() {
    const selectedWallpaperLS = localStorage.getItem(SELECTED_WALLPAPER_LS_KEY);
    if (selectedWallpaperLS !== null) {
      selectedWallpaper.value = Number(selectedWallpaperLS);
    }
  }

  function setSelectedWallpaper(wallpaperId: number | string) {
    localStorage.setItem(SELECTED_WALLPAPER_LS_KEY, wallpaperId.toString());
    selectedWallpaper.value = wallpaperId;
  }

  function deselectWallpaper() {
    localStorage.setItem(SELECTED_WALLPAPER_LS_KEY, '');
    selectedWallpaper.value = null;
  }

  return {
    initSelectedWallpaper,
    selectedWallpaper,
    setSelectedWallpaper,
    deselectWallpaper,
    getWallpaperUrl,
    getWallpaperUrlByFile
  };
});
