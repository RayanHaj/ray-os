// import { watch } from 'vue';
// import type { FileSystemItem, Item } from '@/types/itemTypes.ts';
// import type { RayDb } from 'ray-db-wrapper';

// export function useOnLoadedDirectoryFilesChanged(rayDb: RayDb, currentFileSystemItems: FileSystemItem[]): void {
//   watch(
//     () => currentFileSystemItems,
//     async () => await updateFilesList(),
//   );
//
//   async function updateFilesList() {
//     for (const fileSystemItem of currentFileSystemItems) {
//       if (!fileSystemItem.file) {
//         continue;
//       }
//
//       const file = await rayDb.findOne<Item>('files', 'id', fileSystemItem.file.id);
//       if (file.content.type === 'file') {
//         if (!file.content.rawFile) {
//           continue;
//         }
//
//         if (currentItems.value.some((listFile) => listFile.id === file.id)) {
//           continue;
//         }
//
//         currentItems.value.push(file);
//       }
//     }
//
//     selectAllToggle.value = false;
//   }
// }
