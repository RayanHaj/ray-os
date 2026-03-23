import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export type WallpaperType = 'custom' | 'default';
export const useWallpaperStore = defineStore('wallpaper', () => {
  const selectedWallpaper: Ref<{ id: number; type: WallpaperType } | null> = ref(null);
  const SELECTED_WALLPAPER_LS_KEY = 'selectedWallpaper';
  const FILE_URL_LS_KEY = 'wallpaperFileUrl';

  function getWallpaperUrl(wallpaperName: string) {
    return new URL(`../../assets/wallpaperThumbnails/${wallpaperName}`, import.meta.url).href;
  }

  function getWallpaperByLSFileUrl() {
    return localStorage.getItem(FILE_URL_LS_KEY);
  }

  function getWallpaperUrlByFile(imageFile: File) {
    return URL.createObjectURL(imageFile);
  }

  function initSelectedWallpaper() {
    const selectedWallpaperLS = localStorage.getItem(SELECTED_WALLPAPER_LS_KEY);

    if (selectedWallpaperLS !== null) {
      selectedWallpaper.value = removeIdPrefix(selectedWallpaperLS);
    }
  }

  function saveFileToLS(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(FILE_URL_LS_KEY, reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function setSelectedWallpaper(wallpaperId: number, type: WallpaperType, file?: File) {
    if (file) {
      saveFileToLS(file);
    } else if (localStorage.getItem(FILE_URL_LS_KEY) !== null) {
      localStorage.removeItem(FILE_URL_LS_KEY);
    }

    localStorage.setItem(SELECTED_WALLPAPER_LS_KEY, addIdPrefix(wallpaperId.toString(), type));
    selectedWallpaper.value = { id: wallpaperId, type: type };
  }

  function deselectWallpaper() {
    localStorage.setItem(SELECTED_WALLPAPER_LS_KEY, '');
    selectedWallpaper.value = null;
  }

  function addIdPrefix(wallpaperId: string, type: WallpaperType) {
    switch (type) {
      case 'custom':
        return `custom-${wallpaperId}`;
      case 'default':
        return `default-${wallpaperId}`;
    }
  }

  function removeIdPrefix(wallpaperId: string): { id: number; type: WallpaperType } | null {
    const [prefix, id] = wallpaperId.split('-');

    console.log(wallpaperId)
    switch (prefix) {
      case 'custom':
        return { id: Number(id), type: 'custom' };
      case 'default':
        return { id: Number(id), type: 'default' };
      default:
        return null;
    }
  }

  return {
    initSelectedWallpaper,
    selectedWallpaper,
    setSelectedWallpaper,
    deselectWallpaper,
    getWallpaperUrl,
    getWallpaperByLSFileUrl,
    getWallpaperUrlByFile,
  };
});
