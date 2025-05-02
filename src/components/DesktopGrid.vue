<script setup lang="ts">
import TileComponent from '@/components/DesktopGridTile.vue'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { computed } from 'vue'
import { useBrowserStore } from '@/stores/browser.ts'
import { useTaskbarStore } from '@/stores/taskbar.ts'

const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const tileCountHorizontal = useTileCountGrid().x;
const tileCountVertical = useTileCountGrid().y;
const gridHeight = computed(() => (browserStore.height - taskbarStore.taskbarHeight) - 1);
</script>

<template>
  <div
    class="container"
    :style="{ height: `${gridHeight}px` }"
  >
    <div class="grid" @dragover.prevent @dragenter.prevent>
      <div class="column" v-for="row in tileCountHorizontal" :key="row">
        <div class="row" v-for="column in tileCountVertical" :key="column">
          <TileComponent :position="{x: row, y: column}"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.column {
  display: flex;
  flex-direction: column;
}
</style>
