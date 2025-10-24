<script setup lang="ts">
import { computed, nextTick, onBeforeMount, ref, watch, watchEffect } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileSystemItem, Item, ItemInsert } from '@/types/ItemTypes.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

const windowId = useInjectOrThrow<string>('windowId');
const notepadStore = useNotepadStore();

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const loadedFile = ref<{ windowId: string; fileId: number; fileName: string; text: string }>();
onBeforeMount(async () => await nextTick());
watchEffect(() => {
  if (notepadStore.loadedFile?.windowId !== windowId) {
    return;
  }

  loadedFile.value = notepadStore.loadedFile;
  notepadStore.loadedFile = undefined;
});

function formatFileName(fileName: string) {
  return `${fileName.split('.')[0]}.txt`;
}

const notepadHeaderRef = ref();

async function saveChanges() {
  if (!loadedFile.value) {
    return;
  }

  const fileItem = await rayDb.findOne<Item>('files', 'id', loadedFile.value.fileId);
  if (!fileItem || fileItem.content.type !== 'file') {
    return;
  }

  try {
    const updatedText = loadedFile.value.text;
    const originalFileText = await fileItem.content.rawFile?.text();
    if (
      updatedText === originalFileText &&
      notepadHeaderRef.value.fileName === fileItem.content.name
    ) {
      useToastStore().createToast('no changes made', 'warning', 3000, 'window', windowId);
    } else {
      let fileName = fileItem.content.name;
      if (notepadHeaderRef.value.fileName !== fileItem.content.name) {
        fileName = formatFileName(notepadHeaderRef.value.fileName);
      }

      fileItem.label = fileName;
      fileItem.content.name = fileName;
      fileItem.content.rawFile = new File([updatedText], fileName, { type: 'text/plain' });

      await rayDb.updateOne<ItemInsert>('files', fileItem);
      await rayDb.updateManyByQuery<FileSystemItem>(
        'fileSystem',
        () => ({ file: { name: fileName } }),
        (item) => item.file?.id === fileItem.id,
      );
      useFileSystemStore().updateFileSystem();

      useToastStore().createToast('saved changes', 'success', 2000, 'window', windowId);
    }
  } catch (e) {
    console.error(e);
    useToastStore().createToast('could not save changes', 'error', 5000, 'window', windowId);
  }
}

const fileExplorerWindowId = ref<string>();

function handleUploadClick() {
  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, ['text/plain']);
  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

const fileExplorerWindowIsOpen = computed(() =>
  useWindowStore().openWindowsReferences['File Explorer']?.some(
    (reference) =>
      useWindowStore().getGlobalId('File Explorer', reference.id) === fileExplorerWindowId.value,
  ),
);

watch(
  () => useFileExplorerStore().isInFileSelectStateReturnValue,
  async (newValue) => {
    if (!newValue) return;

    if (newValue.windowId !== windowId) {
      return;
    }

    if (typeof newValue.value !== 'string') {
      const text = await newValue.value.rawFile?.text();
      if (text === undefined || !fileExplorerWindowId.value) {
        return;
      }

      useNotepadStore().initializeNotepadFile(windowId, newValue.fileId, newValue.value.name, text);
      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value);
      useFileExplorerStore().isInFileSelectState = null;
    }
  },
);
</script>

<template>
  <div class="text-reader-container">
    <NotepadHeader
      ref="notepadHeaderRef"
      :file-name="loadedFile?.fileName ?? ''"
      @on-save-changes="saveChanges"
    />
    <div class="text-file-reader" v-if="loadedFile">
      <textarea
        class="text"
        ref="preText"
        v-model="loadedFile.text"
        contenteditable="true"
      ></textarea>
    </div>
    <div class="open-text-file-section" v-else>
      <div class="open-text-file-block">
        <button class="select-text-file-button" @click="handleUploadClick" :disabled="fileExplorerWindowIsOpen">
          <span class="select-text-file-button-content">
            <component
              :is="useSvgOrFallback('Upload').svg"
              :custom-height="50"
              :custom-width="50"
            />
            Click to select a text file
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-reader-container {
  background-color: var(--background-color);
  position: relative;
  container: notepadHeader / size;
  overflow: hidden !important;
}

.text {
  width: 100%;
  padding: 10px;
  color: var(--text-color);
  height: calc(100% - 50px);
  overflow: auto;
  resize: none;
  background: none;
  border: none;
}

.open-text-file-section,
.text-file-reader {
  height: 100%;
  overflow: hidden;
}

.open-text-file-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  padding: 10px;
  max-height: calc(100% - 50px);
}

.open-text-file-section .notepad-header {
  justify-self: start;
}

.open-text-file-block {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-width: fit-content;
  min-height: fit-content;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.select-text-file-p {
  font-size: var(--font-size-elg);
  color: var(--text-color);
  background-color: var(--input-primary-color);
  padding: 5px;
  width: 100%;
  border-radius: 2px;
}

.select-text-file-button {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  min-height: fit-content;
  background: rgb(0, 0, 0, 0.5);
  color: var(--text-color);
  font-size: var(--font-size-elg);
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.select-text-file-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: max-content;
  padding: 10px;
  border-radius: 10px;
}

*:focus {
  outline: none;
}
</style>
