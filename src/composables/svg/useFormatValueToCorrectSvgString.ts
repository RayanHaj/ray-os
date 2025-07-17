export function useFormatValueToCorrectSvgString(value: string) {
  const trimmedName = value.replace(' ', '');
  value = `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  if (value.substring(0, 4).includes('Icon')) {
    return trimmedName;
  }

  return 'Icon'.concat(trimmedName);
}
