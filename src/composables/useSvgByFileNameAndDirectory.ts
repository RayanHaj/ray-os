import type { Component } from 'vue'

const svgs = import.meta.glob('@/components/icons/applications/*.vue');

export async function useSvgByFileNameAndDirectory(directory: string, name: string) {
  const path = `/src/components/icons/${directory}/${name}${!name.includes('.vue') ? '.vue' : ''}`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = await loader() as { default: Component };
  return module.default;
}
