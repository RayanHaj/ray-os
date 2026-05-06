import type { RayDb } from 'ray-db-wrapper';
import { fileSystemLookup } from '@/composables/fileSystem/useIndexedDbHelper.ts';
import type { Application, FileItem, FileSystemItem, Item } from '@/types/ItemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useNotepadStore } from '@/stores/notepad.ts';
import type { Ref } from 'vue';

export async function useHandleStart(
  rayDb: RayDb,
  name: string,
  currentPath: Ref<string[]>,
) {
  if (!name) {
    return;
  }

  const currentDirectory = await fileSystemLookup(rayDb, currentPath.value.join('/'));
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
    handleDirectory(await rayDb.findOne<FileSystemItem>('fileSystem', 'id', fileSystemItem?.id));
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
        await handleFile(fileItem.content, fileId);
    }
  }
}

function handleDirectory(item: FileSystemItem) {
  console.log(item);
}

async function handleFile(item: FileItem, fileId: number) {
  if (!item.rawFile) return;

  useNotepadStore().initializeNotepadFile(useWindowStore().getNextWindowId('Notepad'), fileId, item.name, await item.rawFile.text());
  useWindowStore().pushOpenWindowReference('Notepad');
}

function handleApplication(applicationName: Application) {
  useWindowStore().pushOpenWindowReference(applicationName);
}
