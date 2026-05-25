<script setup lang="ts">
import WallpaperTile from '@/components/applications/settings/wallpapers/WallpaperTile.vue';
import wallpapers from '@/json/wallpapers.json';
import { onBeforeMount, type Ref, ref, watch } from 'vue';
import { useWallpaperStore, type WallpaperType } from '@/stores/settings/wallpaper.ts';
import {
  fileSystemLookup,
  insertItemIntoFileSystem,
} from '@/composables/fileSystem/useIndexedDbHelper.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem, Item } from '@/types/ItemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useDeleteFileSystemItem } from '@/composables/fileSystem/useDeleteFileSystemItem.ts';

const WALLPAPER_COUNT = Object.keys(wallpapers).length;

const customWallpapers: Ref<{ id: number; file: File }[]> = ref([]);
const wallpaperStore = useWallpaperStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

onBeforeMount(async () => {
  wallpaperStore.initSelectedWallpaper();
  await updateCustomWallpapers();
});

watch(
  () => useFileSystemStore().updateFileSystemSignal,
  async (value, oldValue) => {
    if (value === oldValue) return;
    await updateCustomWallpapers();
  },
);

async function updateCustomWallpapers() {
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
}

function onClick(id: number, type: WallpaperType) {
  wallpaperStore.setSelectedWallpaper(id, type);
}

const fileExplorerWindowId = ref<string>();
watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (returnValues) => {
    const returnValue = returnValues.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!returnValue) return;

    // If it is of type 'object' then it should be a FileItem
    if (typeof returnValue.value === 'object' && returnValue.value.rawFile) {
      if (!fileExplorerWindowId.value) return;

      const wallpaperDirectoryId = useFileSystemStore().WALLPAPERS_DIR_ID;
      if (!wallpaperDirectoryId) {
        return;
      }

      const dropItem: FileSystemItem = {
        id: returnValue.id,
        parents: [],
        file: {
          name: returnValue.value.name,
          type: returnValue.value.rawFile.type,
          id: returnValue.fileId,
        },
      };

      await insertItemIntoFileSystem(rayDb, [wallpaperDirectoryId], dropItem);
      await useDeleteFileSystemItem(rayDb, dropItem, true, true);

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
      useFileSystemStore().updateFileSystem();
    }
  },
);

function openSelectWallpaperFileWindow() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, nextFileExplorerId, [
    'image/webp',
    'image/png',
    'image/jpeg',
  ]);

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}
</script>

<template>
  <div class="settings-wallpapers">
    <button class="add-wallpaper-button" @click="openSelectWallpaperFileWindow">
      Add wallpaper
    </button>
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
          @click="onClick(wallpaper.id, 'custom')"
        />
      </div>
      <div class="no-custom-wallpapers-found" v-if="customWallpapers.length === 0">
        <span>No uploaded wallpapers found</span>
        <span
          >Go to File Explorer and drag and drop a file into the Wallpapers system directory</span
        >
      </div>
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

.no-custom-wallpapers-found {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary-color);
  font-size: var(--font-size-sm);
}

.add-wallpaper-button {
  font-size: var(--font-size-lg);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  color: var(--text-color);
  padding-block: 5px;
  padding-inline: 10px;
  width: 100%;
  height: 50px;
  min-height: 50px;
}

hr {
  width: 100%;
  border: var(--window-border-color) solid 2px;
  border-radius: 5px;
}
</style>
