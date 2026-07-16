import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Application, FileSystemItem, Item } from '@/types/itemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import type { Ref } from 'vue';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { useOpenWindowByFileItem } from '@/composables/window/useOpenWindowByFileItem.ts';

export async function useHandleStart(rayDb: RayDb, name: string, currentPath: Ref<string[]>) {
  if (!name) {
    return;
  }

  const currentDirectory = await useFileSystemLookup(rayDb, currentPath.value.join('/'));
  if (currentDirectory instanceof Error) {
    return;
  }

  const fileSystemItem = currentDirectory?.children.find((child) => {
    if (child.directory) {
      return child.directory.name === name;
    } else if (child.file) {
      return child.file.name === name;
    } else {
      return false;
    }
  });

  if (!fileSystemItem?.id) {
    return;
  }

  if (fileSystemItem.directory) {
    handleDirectory(await rayDb.findOne<FileSystemItem>('fileSystem', 'id', fileSystemItem?.id), [
      ...currentPath.value,
    ]);
    return;
  }

  if (fileSystemItem.file) {
    const fileId = fileSystemItem.file.id;
    const fileItem = await rayDb.findOne<Item>('files', 'id', fileId);
    switch (fileItem.content.type) {
      case 'application':
        handleApplication(fileItem.label as Application);
        break;
      case 'file':
        await useOpenWindowByFileItem({ ...fileItem, content: fileItem.content });
    }
  }
}

function handleDirectory(item: FileSystemItem, currentPath: string[]) {
  const nextWindowId = useWindowStore().getNextWindowId('File Explorer');

  if (!item.directory?.name) {
    return;
  }

  currentPath.push(item.directory?.name);

  useFileExplorerStore().setFilePathAtWindow(nextWindowId, currentPath);
  useWindowStore().pushOpenWindowReference('File Explorer');
}

function handleApplication(applicationName: Application) {
  useWindowStore().pushOpenWindowReference(applicationName);
}
