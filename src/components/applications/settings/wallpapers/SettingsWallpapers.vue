<script setup lang="ts">
import WallpaperTile from '@/components/applications/settings/wallpapers/WallpaperTile.vue';
import wallpapers from '@/json/wallpapers.json';
import { onBeforeMount, type Ref, ref } from 'vue';
import { useWallpaperStore, type WallpaperType } from '@/stores/settings/wallpaper.ts';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { Item } from '@/types/ItemTypes.ts';

const customWallpapers: Ref<{ id: number; file: File }[]> = ref([]);
const WALLPAPER_COUNT = Object.keys(wallpapers).length;
const wallpaperStore = useWallpaperStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
onBeforeMount(async () => {
  wallpaperStore.initSelectedWallpaper();

  const wallpaperDirectory = await fileSystemLookup(rayDb, 'Wallpapers');
  if (wallpaperDirectory instanceof Error || wallpaperDirectory === undefined) {
    return;
  }

  customWallpapers.value = (
    await Promise.all(
      wallpaperDirectory.children
        .filter((child) => child.file)
        .map(async (child) => {
          const item = await rayDb.findOne<Item>('files', 'id', child.file!.id);
          if (item.content.type !== 'file') {
            return null;
          }
          return { id: child.id, file: item.content.rawFile };
        }),
    )
  ).filter((item): item is { id: number; file: File } => item !== null);
});

function onClick(id: number, type: WallpaperType, file?: File) {
  wallpaperStore.setSelectedWallpaper(id, type, file);
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
      <div class="custom-wallpapers-list">
        <WallpaperTile
          v-for="wallpaper in customWallpapers"
          :key="wallpaper.id"
          :wallpaper-id="wallpaper.file.name"
          :file="wallpaper.file"
          :selected="
            wallpaper.id === wallpaperStore.selectedWallpaper?.id &&
            wallpaperStore.selectedWallpaper.type === 'custom'
          "
          @click="
            onClick(wallpaper.id, 'custom', wallpaper.file)
          "
        />
      </div>
      <span v-if="customWallpapers.length === 0">No uploaded wallpapers found</span>
    </div>
    <hr />
    <div class="pre-defined-wallpapers">
      <h2>Standard wallpapers</h2>
      <div class="pre-defined-wallpapers-list">
        <WallpaperTile
          v-for="index in WALLPAPER_COUNT"
          :key="index"
          :wallpaper-id="index"
          :selected="
            index === wallpaperStore.selectedWallpaper?.id &&
            wallpaperStore.selectedWallpaper.type === 'default'
          "
          @click="onClick(index, 'default')"
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

.pre-defined-wallpapers {
  display: flex;
  justify-content: start;
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

.custom-wallpapers {
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  gap: 10px;
  min-height: 200px;
  position: relative;
}

.custom-wallpapers-list {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.custom-wallpapers span {
  color: var(--text-secondary-color);
  font-size: var(--font-size-sm);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

hr {
  width: 100%;
  border: var(--window-border-color) solid 2px;
  border-radius: 5px;
}
</style>
