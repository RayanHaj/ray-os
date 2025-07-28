export function useGetWindowIdObjectFromWindowId(fullId: string): {
  windowName: string;
  id: number;
} {
  const splitId = fullId.split('-');
  if (splitId.length !== 2) {
    throw new Error('fault');
  }

  const windowName = splitId[0];
  const id = Number(splitId[1]);
  if (isNaN(id)) {
    throw new Error('fault');
  }

  return { windowName: windowName, id: id };
}
