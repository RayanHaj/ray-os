import type { Component } from 'vue';
import type { AvailableSvgs } from '@/types/AvailableSvgs.ts';
import { useFormatValueToCorrectSvgString } from '@/composables/svg/useFormatValueToCorrectSvgString.ts';

const svgs = import.meta.glob(`@/components/icons/*.vue`);
export async function useSvgByFileNameAndDirectory(name: AvailableSvgs) {
  const formattedName = useFormatValueToCorrectSvgString(name);
  const path = `/src/components/icons/${formattedName}${!formattedName.includes('.vue') ? '.vue' : ''}`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = (await loader()) as { default: Component };
  return module.default;
}
