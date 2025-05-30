import type { Component } from 'vue';

const svgs = import.meta.glob(`@/components/icons/*/*.vue`);
export async function useSvgByFileNameAndDirectory(directory: string, name: string) {
  const formattedName = formatName(name);
  console.log(formattedName);
  const path = `/src/components/icons/${directory}/${formattedName}${!formattedName.includes('.vue') ? '.vue' : ''}`;

  const loader = svgs[path];
  if (!loader) {
    return null;
  }

  const module = (await loader()) as { default: Component };
  return module.default;
}

function formatName(name: string) {
  const trimmedName = name.replace(' ', '');
  if (name.substring(0, 4).includes('Icon')) {
    return trimmedName;
  }

  return 'Icon'.concat(trimmedName);
}
