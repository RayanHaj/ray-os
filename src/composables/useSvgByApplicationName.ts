import type { Component } from 'vue'

const svgs = import.meta.glob('@/components/icons/applications/*.vue');

export async function useSvgByApplicationName(name: string) {
  const path = `/src/components/icons/applications/${name}.vue`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = await loader() as { default: Component };
  return module.default;
}
