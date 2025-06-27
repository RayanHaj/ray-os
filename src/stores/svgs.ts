import { defineStore } from 'pinia';
import { type Component, shallowRef } from 'vue';
import { availableSvgs, type AvailableSvgs } from '@/types/AvailableSvgs.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import { useSvgFallback } from '@/composables/useFallback.ts';

export const useSvgsStore = defineStore('svgs', () => {
  const svgs = shallowRef<{ [svgName in AvailableSvgs]: Component }>(
    {} as { [svgName in AvailableSvgs]: Component },
  );

  async function initializeSvgs() {
    for (const svg of availableSvgs) {
      const foundSvg = await useSvgByFileNameAndDirectory(svg);
      svgs.value[svg] = foundSvg ?? useSvgFallback(svg);
    }
  }

  return { svgs, initializeSvgs };
});
