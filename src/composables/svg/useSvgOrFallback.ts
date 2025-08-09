import { useSvgsStore } from '@/stores/svgs.ts';
import type { AvailableSvgs } from '@/types/AvailableSvgs.ts';
import { useSvgFallback } from '@/composables/svg/useSvgFallback.ts';

export function useSvgOrFallback(value: string | AvailableSvgs) {
  const svgsStore = useSvgsStore();
  const formattedValueKey = value.charAt(0).toUpperCase() + value.slice(1).replace(' ', '');

  if (Object.keys(svgsStore.svgs).includes(formattedValueKey)) {
    return {found: true, svg: svgsStore.svgs[formattedValueKey as AvailableSvgs]}
  } else {
    return {found: false, svg: useSvgFallback(formattedValueKey)};
  }
}
