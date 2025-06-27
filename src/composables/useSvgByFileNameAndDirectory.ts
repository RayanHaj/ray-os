import type { Component } from 'vue';
import type { AllSvgs } from '@/types/AllSvgs.ts';
import { useFormatValueToIconString } from '@/composables/useFormatValueToIconString.ts';

const svgs = import.meta.glob(`@/components/icons/*.vue`);
export async function useSvgByFileNameAndDirectory(name: AllSvgs) {
  const formattedName = useFormatValueToIconString(name);
  const path = `/src/components/icons/${formattedName}${!formattedName.includes('.vue') ? '.vue' : ''}`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = (await loader()) as { default: Component };
  return module.default;
}
