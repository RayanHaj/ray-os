import { defineComponent, h } from 'vue';

export function useSvgFallback(message: string) {
  return defineComponent(() => {
    return () => {
      return h('div', {
        class: 'svg-fallback',
        innerHTML: message,
        style: { display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'default' },
      });
    };
  });
}
