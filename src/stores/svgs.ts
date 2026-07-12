import { defineStore } from 'pinia';
import { type Component, shallowRef } from 'vue';
import { availableSvgs, type AvailableSvgs } from '@/types/availableSvgs.ts';
import { useSvgByFileAndDirectoryName } from '@/composables/svg/useSvgByFileAndDirectoryName.ts';
import { useSvgFallback } from '@/composables/svg/useSvgFallback.ts';

export const useSvgsStore = defineStore('svgs', () => {
  const svgs = shallowRef<{ [svgName in AvailableSvgs]: Component }>(
    {} as { [svgName in AvailableSvgs]: Component },
  );

  async function initializeSvgs() {
    for (const svg of availableSvgs) {
      const foundSvg = await useSvgByFileAndDirectoryName(svg);
      svgs.value[svg] = foundSvg ?? useSvgFallback(svg);
    }
  }

  return { svgs, initializeSvgs };
});
