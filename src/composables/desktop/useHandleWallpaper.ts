import wallpapersJSON from '@/config/wallpapers.json';
import { ref, type Ref, watch } from 'vue';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Item } from '@/types/itemTypes.ts';

export const useHandleWallpaper = () => {
  const wallpaperStore = useWallpaperStore();
  const staticWallpapers: Record<string, string> = wallpapersJSON;

  const wallpaperUrl: Ref<string> = ref('');

  const rayDb = useInjectOrThrow<RayDb>('rayDb');
  watch(
    () => wallpaperStore.selectedWallpaper,
    async (newSelectedWallpaper, oldSelectedWallpaper) => {
      if (newSelectedWallpaper === oldSelectedWallpaper || !newSelectedWallpaper) return;

      /**
       * if selected wallpaper is of type 'custom' it will find the wallpaper in the 'Wallpapers'
       * directory and get the wallpaper file from the files object store
       * else it will look for the wallpaper in the default wallpapers list
       */
      if (newSelectedWallpaper.type === 'custom') {
        const wallpaperDirectory = await useFileSystemLookup(rayDb, 'Wallpapers');
        if (wallpaperDirectory instanceof Error || wallpaperDirectory === undefined) return;

        const wallpaper = wallpaperDirectory.children.find(
          (wallpaper) => wallpaper.id === newSelectedWallpaper.id,
        );

        if (!wallpaper || !wallpaper?.file) return;

        // gets the raw wallpaper file from the files object store
        const wallpaperFile = await rayDb.findOne<Item>('files', 'id', wallpaper.file.id);

        if (wallpaperFile.content.type !== 'file' || !wallpaperFile.content.rawFile) return;

        wallpaperUrl.value = `url('${wallpaperStore.getWallpaperUrlByFile(wallpaperFile.content.rawFile)}')`;
      } else {
        const fileName = staticWallpapers[`wallpaper-${newSelectedWallpaper.id}`];
        const url = `/wallpapers/${fileName}`;
        wallpaperUrl.value = `url('${url}')`;
      }
    },
    { immediate: true },
  );

  return {
    wallpaperUrl
  }
}
