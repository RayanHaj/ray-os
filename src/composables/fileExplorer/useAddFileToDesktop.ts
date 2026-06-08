export async function useAddFileToDesktop() {
  // const fileSystemItemId = multiSelect.getFirst();
  // const fileSystemItem = currentFileSystemItems.find(
  //   (fileSystemItem) => fileSystemItem.id === fileSystemItemId,
  // );
  //
  // if (!fileSystemItem) return;
  //
  // // sort in ascending tileId order
  // const desktopItems = await useDesktopStore()
  //   .getDesktopItems(rayDb)
  //   .then((desktopItems) => desktopItems.sort((a, b) => a.tileId - b.tileId));
  //
  // console.log(desktopItems);
  //
  // let tileId = 1;
  // let previousTileId = -1;
  // if (desktopItems.length > 0) {
  //   for (const desktopItem of desktopItems) {
  //     if (previousTileId === -1 || desktopItem.tileId - 1 === previousTileId) {
  //       previousTileId = desktopItem.tileId;
  //       tileId = previousTileId + 1;
  //     }
  //   }
  // }
  //
  // console.log({
  //   id: fileSystemItem.id,
  //   tileId: tileId,
  //   type: fileSystemItem.type as 'application' | 'file' | 'directory',
  //   path: fileSystemItem.path,
  // });
  //
  // await useDesktopStore().addDesktopItem(rayDb, {
  //   id: fileSystemItem.id ?? fileSystemItem.file?.id,
  //   tileId: tileId,
  //   type: fileSystemItem.type as 'application' | 'file' | 'directory',
  //   path: fileSystemItem.path,
  // });
}
