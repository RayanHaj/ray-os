<script setup lang="ts">
import DesktopMain from '@/components/desktop/DesktopMain.vue';
import TaskbarMain from '@/components/taskbar/TaskbarMain.vue';
import { type ComputedRef, type Ref, ref, watch } from 'vue';
import WindowMain from '@/components/WindowMain.vue';
import { type WindowFlatReference } from '@/types/WindowTypes.ts';
import { useFlatOpenWindowsReferencesFull } from '@/composables/window/useFlatOpenWindowsReferencesFull.ts';

import DesktopSnapLayout from '@/components/DesktopSnapLayout.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useOnOuterClickClose } from '@/composables/helpers/useOnOuterClickClose.ts';
import UiToast from '@/ui/UiToast.vue';
import { useGetWindowContentComponent } from '@/composables/window/useGetWindowContentComponent.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';
import wallpapersJSON from '@/json/wallpapers.json';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Item } from '@/types/ItemTypes.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
const wallpapers: Record<string, string> = wallpapersJSON;

const references: ComputedRef<WindowFlatReference[]> = useFlatOpenWindowsReferencesFull();
const contextMenuStore = useContextMenuStore();

const wallpaperStore = useWallpaperStore();

const wallpaperUrl: Ref<string> = ref('');

const rayDb = useInjectOrThrow<RayDb>('rayDb');

watch(
  () => wallpaperStore.selectedWallpaper,
  async (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }

    if (wallpaperStore.selectedWallpaper?.type === 'custom') {
      const wallpaperDirectory = await fileSystemLookup(rayDb, 'Wallpapers');
      if (wallpaperDirectory instanceof Error || wallpaperDirectory === undefined) {
        return;
      }

      const wallpaper = wallpaperDirectory.children.find(
        (wallpaper) => wallpaper.id === wallpaperStore.selectedWallpaper?.id,
      );

      if (wallpaper === null || wallpaper?.file === null) {
        return;
      }

      const wallpaperFile = await rayDb.findOne<Item>('files', 'id', wallpaper!.file!.id);
      if (wallpaperFile.content.type !== 'file') {
        return;
      }
      if (!wallpaperFile.content.rawFile) {
        return;
      }

      wallpaperUrl.value = `url('${wallpaperStore.getWallpaperUrlByFile(wallpaperFile.content.rawFile)}')`;
    } else {
      const fileName = wallpapers[`wallpaper-${wallpaperStore.selectedWallpaper?.id}`];
      const url = new URL(`../assets/wallpapers/${fileName}`, import.meta.url).href;
      wallpaperUrl.value = `url('${url}')`;
    }
  },
  { immediate: true },
);

const fixedSizeWindows: Record<string, { width: number; height: number }> = {
  Doom: { width: 766, height: 507 },
  Calculator: { width: 300, height: 375 },
};

const inlineWindows: Record<string, boolean> = { 'Video Player': true, 'Image Viewer': true };

const minWidthWindows: Record<string, { width: number }> = { Notepad: { width: 445 } };
const minHeightWindows: Record<string, { height: number }> = { Notepad: { height: 208 } };
</script>

<template>
  <main
    @click="useOnOuterClickClose($event.target as HTMLElement)"
    :style="{ backgroundImage: wallpaperUrl }"
  >
    <UiToast toast-location="desktop" />
    <ContextMenu v-show="contextMenuStore.isShown()" />
    <DesktopSnapLayout />
    <WindowMain
      v-for="reference of references"
      :key="useWindowStore().getGlobalId(reference.label, reference.id)"
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
    >
      <UiToast
        toast-location="window"
        :window-id="useWindowStore().getGlobalId(reference.label, reference.id)"
      />
    </WindowMain>
    <DesktopMain />
    <TaskbarMain />
  </main>
</template>

<style scoped>
main {
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
  background-color: var(--background-color);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
