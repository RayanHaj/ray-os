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

const browserStore = useBrowserStore();
const desktopStore = useDesktopStore();
const wallpaperStore = useWallpaperStore();
const gridStore = useDesktopStore();
const svgsStore = useSvgsStore();
const snapLayoutStore = useSnapLayoutStore();

const initialised = ref(false);
const rayDb = useInjectOrThrow<RayDb>('rayDb');

const hasThrown = ref(false);
onBeforeMount(async () => {
  browserStore.startListening();
  wallpaperStore.initSelectedWallpaper();

  try {
    await svgsStore.initializeSvgs();
    await gridStore.initializeTileContent(rayDb);
    initialised.value = true;

    await desktopStore.updateDesktopDirectory(rayDb);
  } catch (e) {
    hasThrown.value = true;
  }
});

function softReset() {
  localStorage.clear();
  location.reload();
}

async function hardReset() {
  await useResetState(rayDb);
}


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
  <Transition name="fade">
    <DesktopView v-if="initialised && !hasThrown" />
  </Transition>
  <div
    v-if="!initialised && !hasThrown"
    style="
      display: flex;
      height: 100vh;
      align-items: center;
      justify-content: center;
      background: #000;
      color: #fff;
      font-family: monospace;
    "
  >
    Loading RayOS...
  </div>
  <div v-else>
    <div>Something has gone wrong, try one of these fixes</div>
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
</style>
