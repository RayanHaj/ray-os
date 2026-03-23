import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

export const useWallpaperStore = defineStore('wallpaper', () => {
  const selectedWallpaper: Ref<number | null> = ref(null);
  const SELECTED_WALLPAPER_LS_KEY = 'selectedWallpaper';

  function getWallpaperUrl(wallpaperName: string) {
    return `../../../../assets/wallpaperThumbnails/${wallpaperName}`;
  }

  function initSelectedWallpaper() {
    const selectedWallpaperLS = localStorage.getItem(SELECTED_WALLPAPER_LS_KEY);
    if (selectedWallpaperLS !== null) {
      selectedWallpaper.value = Number(selectedWallpaperLS);
    }
  }

  function setSelectedWallpaper(wallpaperId: number) {
    localStorage.setItem(SELECTED_WALLPAPER_LS_KEY, wallpaperId.toString());
    selectedWallpaper.value = wallpaperId;
  }

  return { initSelectedWallpaper, selectedWallpaper, setSelectedWallpaper, getWallpaperUrl };
});
