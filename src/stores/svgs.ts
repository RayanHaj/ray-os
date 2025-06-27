import { defineStore } from 'pinia';
import { type Component, shallowRef } from 'vue';
import { allSvgs, type AllSvgs } from '@/types/AllSvgs.ts';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import { useSvgFallback } from '@/composables/useFallback.ts';

export const useSvgsStore = defineStore('svgs', () => {
  const svgs = shallowRef<{ [svgName in AllSvgs]: Component }>(
    {} as { [svgName in AllSvgs]: Component },
  );

  async function initializeSvgs() {
    for (const svg of allSvgs) {
      const foundSvg = await useSvgByFileNameAndDirectory(svg);
      svgs.value[svg] = foundSvg ?? useSvgFallback(svg);
    }
  }

  return { svgs, initializeSvgs };
});
