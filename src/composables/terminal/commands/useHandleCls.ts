import type { Ref } from 'vue';

export function useHandleCls(lines: Ref<Array<{ line: string; isPlain: boolean }>>) {
  lines.value.splice(1);
}
