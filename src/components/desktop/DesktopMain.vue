<script setup lang="ts">
import DesktopTile from '@/components/desktop/DesktopTile.vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { computed, ref } from 'vue';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useGetTileId } from '@/composables/desktop/useGetTileId.ts';

const socials = ['Github'] as const;
type Socials = (typeof socials)[number];

const rowCount = computed(() => useTileCountGrid().x.value);
const columnCount = computed(() => useTileCountGrid().y.value);
const tileIsBeingDragged = ref<boolean>(false);

function onMouseLeave(_: MouseEvent) {
  if (tileIsBeingDragged.value) {
    return;
  }
}

function navigateToSocialPage(social: Socials) {
  switch (social) {
    case 'Github': {
      window.open('https://github.com/RayanHaj', '_blank');
    }
  }
}
</script>
<template>
  <div class="desktop" :style="{ height: `calc(100% - ${useTaskbarStore().taskbarHeight}px)` }">
    <div
      class="grid-wrapper"
      @mouseleave="onMouseLeave"
      @dragover.prevent
      @dragenter.prevent
      :style="{ height: `${useBrowserStore().heightExcTaskbar}px` }"
    >
      <div v-for="rowPosition in rowCount" :key="rowPosition">
        <DesktopTile
          v-for="columnPosition in columnCount"
          :key="columnPosition"
          :tile-id="useGetTileId({ x: rowPosition, y: columnPosition }).value"
          @drag-started="tileIsBeingDragged = true"
          @drag-ended="tileIsBeingDragged = false"
        />
      </div>
    </div>
    <div class="socials">
      <button
        v-for="social in socials"
        :key="social"
        class="socials-icons"
        @click="navigateToSocialPage(social)"
      >
        <component class="social-svg" :is="useSvgOrFallback(social).svg" />
      </button>
      <p class="socials-name">Made by Rayan el Hajaoui</p>
    </div>
  </div>
</template>
<style scoped>
.desktop {
  --socials-width: 70px;

  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;

  background-color: var(--background-color);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.grid-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - var(--socials-width));
}

.socials {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: var(--socials-width);
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-left: var(--window-border-color) 1px solid;
}

.social-svg {
  width: 35px;
  height: 35px;
}

.socials-icons {
  display: flex;
  gap: 15px;
  flex-direction: column;
  justify-content: center;
  background: none;
  border: none;
}

.socials-icons:hover {
  cursor: pointer;
}

.socials-name {
  padding-bottom: 6px;
  transform: rotate(90deg);
  font-size: 20px;
  width: max-content;
}

@media (max-height: 575px) {
  .socials-name {
    font-size: 13px;
  }

  .social-svg {
    width: 25px;
    height: 25px;
  }
}

@media (max-height: 410px) {
  .socials-name {
    display: none;
  }
}
</style>
