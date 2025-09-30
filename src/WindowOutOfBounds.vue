<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import {
  useGetWindowOutOfBoundsPositionValues,
} from '@/composables/window/useGetWindowOutOfBoundsPositionValues.ts';
import { useBrowserStore } from '@/stores/browser.ts';

const outOfBoundsPositions = ref<{
  side: 'right' | 'left' | 'top' | 'bottom' | '';
  positions: { left: string; top: string; width: string; height: string };
}>({ side: '', positions: { left: '0', top: '0', width: '0', height: '0' } });

const windowStore = useWindowStore();
watch(
  () => windowStore.windowOutOfBounds,
  (newValue, oldValue) => {
    const positionValues = useGetWindowOutOfBoundsPositionValues();
    if ((newValue === oldValue && newValue.side === outOfBoundsPositions.value.side)) return;
    if (newValue.side === '' || newValue.windowId === '') {
      outOfBoundsPositions.value = {
        side: '',
        positions: { left: '0', top: '0', width: '0', height: '0' },
      };
      return;
    }

    if (!positionValues) {
      return;
    }

    outOfBoundsPositions.value = {
      side: newValue.side,
      positions: positionValues.positions,
    };
  },
);
</script>
<template>
  <div v-show="outOfBoundsPositions.side !== ''" class="out-of-bounds-container" :style="{width: '100%', height: `${useBrowserStore().heightExcTaskbar}px`}">
    <div class="snap-preview-direction" :style="{...outOfBoundsPositions.positions, height: `calc(${outOfBoundsPositions.positions.height} - 20px)`}"/>
  </div>
</template>
<style scoped>
  .out-of-bounds-container {
    position: absolute;
    padding: 10px;
  }
  .snap-preview-direction {
    background: rgba(0, 0, 0, 0.21);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8.5px);
    -webkit-backdrop-filter: blur(8.5px);
    border: 1px solid rgba(0, 0, 0, 0.37);
    position: relative;
    border-radius: 10px;
  }
</style>
