<script setup lang="ts">
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import { useSvgsStore } from '@/stores/svgs.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import DesktopView from '@/views/DesktopView.vue';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';

const sereneSoundsStore = useSereneSoundsStore();
const browserStore = useBrowserStore();
const wallpaperStore = useWallpaperStore();
const gridStore = useDesktopStore();
const svgsStore = useSvgsStore();
const snapLayoutStore = useSnapLayoutStore();

const initialised = ref(false);
const rayDb = useInjectOrThrow<RayDb>('rayDb');
onBeforeMount(async () => {
  browserStore.startListening();
  wallpaperStore.initSelectedWallpaper();
  await svgsStore.initializeSvgs();
  await sereneSoundsStore.initializeSounds();
  await gridStore.initializeTileContent(rayDb);
  initialised.value = true;
});
onUnmounted(() => {
  browserStore.stopListening();
});

document.addEventListener('mouseout', function (event) {
  if (!event.relatedTarget) {
    snapLayoutStore.closeSnapLayout();
  }
});
</script>

<template>
  <DesktopView v-if="initialised" />
</template>

<style scoped></style>
