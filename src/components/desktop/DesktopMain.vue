<script setup lang="ts">
import DesktopTile from '@/components/desktop/DesktopTile.vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { computed } from 'vue';
import {
  useInitializeContextMenu
} from '@/composables/contextMenu/useInitializeContextMenu.ts';

const rowCount = computed(() => useTileCountGrid().x.value);
const columnCount = computed(() => useTileCountGrid().y.value);

function onDesktopRightClick(event: MouseEvent) {
  useInitializeContextMenu(event).desktop().initialize(
    {
      Copy: () => {
        console.log('copy');
      },
      Paste: () => {
        console.log('paste');
      }
    },
    {
      test: () => {
        console.log('test');
      },
      properties: () => {
        console.log('properties');
      }
    }
  );
}
</script>

<template>
  <div
    class="desktop-grid"
    @dragover.prevent
    @dragenter.prevent
    @click.right.prevent="onDesktopRightClick"
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
</template>

<style scoped>
.desktop-grid {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
