export const useFormatValueToCorrectSvgString = (value: string) => {
  const trimmedName = value.replace(' ', '');
  value = `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

  const startsWithIcon = value.substring(0, 4).includes('Icon');
  return startsWithIcon ? trimmedName : 'Icon'.concat(trimmedName);
};
