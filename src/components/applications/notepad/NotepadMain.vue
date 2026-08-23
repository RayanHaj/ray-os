<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import type { RayDb } from 'ray-db-wrapper';
import { useSaveChanges } from '@/composables/notepad/useSaveChanges.ts';
import FileSelectButton from '@/components/applications/mediaPlayers/FileSelectButton.vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import { createNotepadFile, type NotepadFile } from '@/types/notepadTypes.ts';
import type { Item } from '@/types/itemTypes.ts';
import { createConfirmDialog } from '@/composables/confirmDialog/createConfirmDialog.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const notepadFile = reactive<NotepadFile>(createNotepadFile());

const { pointerEventsDisabled } = defineProps<{
  pointerEventsDisabled: boolean
}>();

const notepadStore = useNotepadStore();
watch(
  () => notepadStore.loadedFile,
  (newLoadedFile) => {
    if (newLoadedFile?.windowId !== windowId) return;
    notepadFile.fileId = newLoadedFile.fileId;
    notepadFile.fileName = newLoadedFile.fileName;
    notepadFile.text = newLoadedFile.text;
    notepadStore.loadedFile = undefined;
  },
  { immediate: true },
);

async function onFileSelectReturnValue(returnValue: {
  windowId: string;
  value: FileSelectReturnItem[];
}) {
  for (const value of returnValue.value) {
    if (!value.fileItem.rawFile) return;

    const rawFileText = await value.fileItem.rawFile.text();

    useNotepadStore().initializeNotepadFile(windowId, {
      fileId: value.fileId,
      fileName: value.fileItem.name,
      text: rawFileText,
    });
  }
}

const fileIsLoaded = computed(() => notepadFile.fileId !== -1 && notepadFile.fileName !== '');

defineExpose({
  onWindowClose: async (left: string, top: string) => {
    const fileItem = await rayDb.findOne<Item>('files', 'id', notepadFile.fileId);
    if (!fileItem || fileItem.content.type !== 'file') return true;

    const updatedText = notepadFile.text;
    const originalFileText = await fileItem.content.rawFile?.text();

    if (updatedText === originalFileText && notepadFile.fileName === fileItem.content.name) {
      return true;
    } else {
      const result = await createConfirmDialog(
        'Unsaved changes will be lost. Continue?',
        left,
        top,
      );
      return result ?? false;
    }
  },
});
</script>

<template>
  <div class="notepad">
    <NotepadHeader
      :_file-name="notepadFile?.fileName ?? ''"
      :file-is-loaded="fileIsLoaded"
      :file-id="notepadFile?.fileId ?? null"
      :pointer-events-disabled="pointerEventsDisabled"
      @on-save-changes="useSaveChanges(rayDb, $event, windowId, notepadFile)"
    />
    <div v-if="fileIsLoaded" class="notepad-reader">
      <textarea v-model="notepadFile.text" contenteditable="true" />
    </div>
    <FileSelectButton
      v-else
      :window-id="windowId"
      :allowed-file-types="['text/plain']"
      @return-value="onFileSelectReturnValue"
      >text file</FileSelectButton
    >
  </div>
</template>

<style scoped>
.notepad {
  background-color: var(--background-color);
  position: relative;
  container: notepadMain / size;
  overflow: hidden !important;

  --notepad-header-height: 50px;
  --notepad-header-column-height: 95px;
}

.notepad-reader {
  height: 100%;
  overflow: hidden;
}

.notepad-reader textarea {
  width: 100%;
  padding: 10px;
  height: calc(100% - var(--notepad-header-height));
  overflow: auto;
  resize: none;
  background: none;
  border: none;
}

.file-select-button-container {
  max-height: calc(100% - var(--notepad-header-height));
}
@container notepadMain (max-width: 550px) {
  .file-select-button-container {
    max-height: calc(100% - var(--notepad-header-column-height));
  }

  .notepad-reader textarea {
    width: 100%;
    padding: 10px;
    height: calc(100% - var(--notepad-header-column-height));
    overflow: auto;
    resize: none;
    background: none;
    border: none;
  }
}
</style>
