<script setup lang="ts">
import DesktopTile from '@/components/desktop/DesktopTile.vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { computed } from 'vue';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const rowCount = computed(() => useTileCountGrid().x.value);
const columnCount = computed(() => useTileCountGrid().y.value);

function onDesktopRightClick(event: MouseEvent) {
  useInitializeContextMenu(event)
    .desktop()
    .initialize(
      {
        Copy: () => {
          console.log('copy');
        },
        Paste: () => {
          console.log('paste');
        },
      },
      {
        test: () => {
          console.log('test');
        },
        properties: () => {
          console.log('properties');
        },
      },
    );
}
</script>

<template>
  <div class="desktop" :style="{ height: `calc(100% - ${useTaskbarStore().taskbarHeight}px)` }">
    <div
      class="desktop-grid"
      @dragover.prevent
      @dragenter.prevent
      @contextmenu.prevent="onDesktopRightClick"
      :style="{ height: `${useBrowserStore().heightExcTaskbar}px` }"
    >
      <div v-for="rowPosition in rowCount" :key="rowPosition">
        <DesktopTile
          v-for="columnPosition in columnCount"
          :key="columnPosition"
          :tile-position="{ x: rowPosition, y: columnPosition }"
        />
      </div>
    </div>
    <div class="socials">
      <div class="socials-icons">
        <Component
          v-for="icon in ['Github', 'LinkedIn']"
          :key="icon"
          class="social-svg"
          :is="useSvgOrFallback(icon).svg"
        />
      </div>
      <p class="socials-name">Made by Rayan el Hajaoui</p>
    </div>
  </div>
</template>

<style scoped>
.desktop {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}
.desktop-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 60px);
}

.socials {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 70px;
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
}

.socials-name {
  padding-bottom: 6px;
  color: var(--text-color);
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
