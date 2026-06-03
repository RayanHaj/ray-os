<script setup lang="ts">
import { type ComputedRef, type Ref, ref, watch } from 'vue';
import { type WindowFlatReference } from '@/types/windowTypes';

import DesktopMain from '@/components/desktop/DesktopMain.vue';
import TaskbarMain from '@/components/taskbar/TaskbarMain.vue';
import WindowMain from '@/components/window/WindowMain.vue';

import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import UiToast from '@/ui/UiToast.vue';

import { useWindowStore } from '@/stores/window.js';
import { useWallpaperStore } from '@/stores/settings/wallpaper.js';
import { useContextMenuStore } from '@/stores/contextMenu.js';

import { useFlatOpenWindowsReferencesFull } from '@/composables/window/useFlatOpenWindowsReferencesFull.js';
import { useOnOuterClickClose } from '@/composables/helpers/useOnOuterClickClose.js';
import { useGetWindowContentComponent } from '@/composables/window/useGetWindowContentComponent.js';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.js';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.js';

import type { Item } from '@/types/itemTypes';
import type { RayDb } from 'ray-db-wrapper';

import wallpapersJSON from '@/json/wallpapers.json';

const wallpapers: Record<string, string> = wallpapersJSON;

const windowFlatReferences: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();

const fixedSizeWindows: Record<string, { width: number; height: number }> = {};

// const fixedSizeWindows: Record<string, { width: number; height: number }> = {
//   Properties: { width: 300, height: 350 },
// };

const minWidthWindows: Record<string, { width: number }> = {
  Notepad: { width: 300 },
  'Audio Player': { width: 330 },
  Properties: { width: 300 },
};

const minHeightWindows: Record<string, { height: number }> = {
  Notepad: { height: 208 },
  Calculator: { height: 315 },
  'File Explorer': { height: 315 },
  'Audio Player': { height: 315 },
  Properties: { height: 350 },
};

// Windows that cannot be minified
const inlineWindows: Record<string, boolean> = {
  'Video Player': true,
  'Image Viewer': true,
  Properties: true,
};

// Windows that should not show a svg in the window header
const showNoApplicationSvgsFor: string[] = ['Properties'];

const contextMenuStore = useContextMenuStore();
const wallpaperStore = useWallpaperStore();

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
      const wallpaperDirectory = await fileSystemLookup(rayDb, 'Wallpapers');
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
      const fileName = wallpapers[`wallpaper-${newSelectedWallpaper.id}`];
      const url = `/wallpapers/${fileName}`;
      wallpaperUrl.value = `url('${url}')`;
    }
  },
  { immediate: true },
);
</script>

<template>
  <main @click="useOnOuterClickClose($event.target as HTMLElement)">
    <UiToast toast-location="desktop" />
    <ContextMenu v-show="contextMenuStore.isShown" />
    <DesktopSnapLayout />
    <WindowMain
      v-for="reference of windowFlatReferences"
      :key="useWindowStore().getWindowId(reference.label, reference.id)"
      :reference="reference"
      :window-content-component="useGetWindowContentComponent(reference.label)"
      :window-type="
        fixedSizeWindows[reference.label] !== undefined
          ? 'fixed'
          : inlineWindows[reference.label] !== undefined
            ? 'inline'
            : undefined
      "
      :width="
        fixedSizeWindows[reference.label]
          ? `${fixedSizeWindows[reference.label].width}px`
          : undefined
      "
      :height="
        fixedSizeWindows[reference.label]
          ? `${fixedSizeWindows[reference.label].height}px`
          : undefined
      "
      :min-width="
        minWidthWindows[reference.label] ? `${minWidthWindows[reference.label].width}px` : undefined
      "
      :min-height="
        minHeightWindows[reference.label]
          ? `${minHeightWindows[reference.label].height}px`
          : undefined
      "
      :show-no-application-svgs-for="showNoApplicationSvgsFor"
    >
      <UiToast
        toast-location="window"
        :window-id="useWindowStore().getWindowId(reference.label, reference.id)"
      />
    </WindowMain>
    <DesktopMain :style="{ backgroundImage: wallpaperUrl }" />
    <TaskbarMain />
  </main>
</template>

<style scoped>
main {
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}
</style>
