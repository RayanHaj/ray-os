import type { Component } from 'vue';
import type { AvailableSvgs } from '@/types/availableSvgs.ts';
import { useFormatValueToCorrectSvgString } from '@/composables/svg/useFormatValueToCorrectSvgString.ts';

const svgs = import.meta.glob(`@/assets/svgs/*.vue`);
export async function useSvgByFileAndDirectoryName(name: AvailableSvgs) {
  const formattedName = useFormatValueToCorrectSvgString(name);
  const path = `/src/assets/svgs/${formattedName}${!formattedName.includes('.vue') ? '.vue' : ''}`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = (await loader()) as { default: Component };
  return module.default;
}
