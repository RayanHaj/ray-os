<script setup lang="ts">
import DesktopTile from '@/components/desktop/DesktopTile.vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { computed, ref } from 'vue';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import MultiSelectionBox from '@/components/MultiSelectionBox.vue';
import { useMultiSelectionBoxStore } from '@/stores/multiSelectionBox.ts';

const socials = ['Github'] as const;
type Socials = (typeof socials)[number];

const rowCount = computed(() => useTileCountGrid().x.value);
const columnCount = computed(() => useTileCountGrid().y.value);
const tileIsBeingDragged = ref<boolean>(false);

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

const multiSelectionBoxStore = useMultiSelectionBoxStore();

function onMouseDown(e: MouseEvent) {
  if (tileIsBeingDragged.value) {
    return;
  }

  multiSelectionBoxStore.multiSelectionVariables.startX = e.clientX;
  multiSelectionBoxStore.multiSelectionVariables.startY = e.clientY;

  multiSelectionBoxStore.multiSelectionVariables.left = e.clientX;
  multiSelectionBoxStore.multiSelectionVariables.top = e.clientY;

  addEventListener('mousemove', onMouseMove);
}

function onMouseMove(e: MouseEvent) {
  multiSelectionBoxStore.multiSelectionVariables.isSelecting = true;
  multiSelectionBoxStore.multiSelectionVariables.width =
    e.clientX - multiSelectionBoxStore.multiSelectionVariables.startX;
  multiSelectionBoxStore.multiSelectionVariables.height =
    e.clientY - multiSelectionBoxStore.multiSelectionVariables.startY;
}

function onMouseUp(e: MouseEvent) {
  if (tileIsBeingDragged.value) {
    return;
  }

  removeEventListener('mousemove', onMouseMove);
  Object.assign(multiSelectionBoxStore.multiSelectionVariables, {
    isSelecting: false,
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
    left: 0,
    top: 0,
  });
}
function onMouseLeave(e: MouseEvent) {
  if (tileIsBeingDragged.value) {
    return;
  }

  removeEventListener('mousemove', onMouseMove);
  multiSelectionBoxStore.multiSelectionVariables.isSelecting = false;
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
      class="desktop-grid"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
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
          @drag-started="tileIsBeingDragged = true"
          @drag-ended="tileIsBeingDragged = false"
        />
      </div>
      <MultiSelectionBox
        :is-selecting="multiSelectionBoxStore.multiSelectionVariables.isSelecting"
        :width="multiSelectionBoxStore.multiSelectionVariables.width"
        :height="multiSelectionBoxStore.multiSelectionVariables.height"
        :left="multiSelectionBoxStore.multiSelectionVariables.left"
        :top="multiSelectionBoxStore.multiSelectionVariables.top"
      />
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
}
.desktop-grid {
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
  cursor: pointer;
}

button.socials-icons {
  background: none;
  border: none;
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
