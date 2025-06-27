import { useSvgsStore } from '@/stores/svgs.ts';
import type { AllSvgs } from '@/types/AllSvgs.ts';
import { useSvgFallback } from '@/composables/useFallback.ts';

export function useSvgOrFallback(value: string | AllSvgs) {
  const svgsStore = useSvgsStore();
  const formattedValueKey = value.charAt(0).toUpperCase() + value.slice(1).replace(' ', '');

  if (Object.keys(svgsStore.svgs).includes(formattedValueKey)) {
    return svgsStore.svgs[formattedValueKey as AllSvgs];
  } else {
    return useSvgFallback(formattedValueKey);
  }
}
