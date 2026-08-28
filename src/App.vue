<script setup lang="ts">
import { useBrowserStore } from '@/stores/browser.ts';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import { useDesktopStore } from '@/stores/desktop.ts';
import { useSvgsStore } from '@/stores/svgs.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { RayDb } from 'ray-db-wrapper';
import DesktopView from '@/views/DesktopView.vue';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';
import { useWallpaperStore } from '@/stores/settings/wallpaper.ts';
import { useResetState } from '@/composables/useResetState.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { initStatus } from '@/types/appTypes.ts';

const svgsStore = useSvgsStore();
const browserStore = useBrowserStore();
const desktopStore = useDesktopStore();
const taskbarStore = useTaskbarStore();
const wallpaperStore = useWallpaperStore();
const snapLayoutStore = useSnapLayoutStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const initialized = ref<initStatus>(initStatus.LOADING);
onBeforeMount(async () => {
  browserStore.startListening();
  wallpaperStore.initSelectedWallpaper();

  try {
    await svgsStore.initializeSvgs();
    await desktopStore.initializeTileContent(rayDb);
    await taskbarStore.initializeTileContent(rayDb);
    initialized.value = initStatus.INITIALIZED;
  } catch (e) {
    console.error(e);
    initialized.value = initStatus.THROWN;
  }
});

const hardReset = async () => await useResetState(rayDb);
const softReset = () => {
  localStorage.clear();
  location.reload();
};

onUnmounted(() => browserStore.stopListening());

document.addEventListener('mouseout', function (event) {
  if (!event.relatedTarget) snapLayoutStore.closeSnapLayout();
});
</script>

<template>
  <Transition name="fade">
    <DesktopView v-if="initialized === initStatus.INITIALIZED" />
  </Transition>
  <div v-if="initialized === initStatus.LOADING" class="loading-screen">Loading RayOS...</div>
  <div v-if="initialized === initStatus.THROWN">
    <p>Something has gone wrong, try one of these fixes</p>
    <button @click="softReset()">Soft reset</button>
    <button @click="hardReset()">Hard reset</button>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from {
  opacity: 0;
}

.loading-screen {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-family: monospace;
}
</style>
