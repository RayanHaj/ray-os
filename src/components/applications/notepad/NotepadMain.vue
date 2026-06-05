<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import type { RayDb } from 'ray-db-wrapper';
import { useSaveChanges } from '@/composables/notepad/useSaveChanges.ts';
import FileSelectButton from '@/components/applications/mediaPlayers/FileSelectButton.vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const windowId = useInjectOrThrow<string>('windowId');
const loadedFile = ref<{ windowId: string; fileId: number; fileName: string; text: string }>();

watch(
  () => useNotepadStore().loadedFile,
  (newLoadedFile) => {
    if (newLoadedFile?.windowId !== windowId) return;
    loadedFile.value = newLoadedFile;
    useNotepadStore().loadedFile = undefined;
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

    useNotepadStore().initializeNotepadFile(
      windowId,
      value.fileId,
      value.fileItem.name,
      rawFileText,
    );
  }
}

const fileIsLoaded = computed(() => loadedFile.value?.windowId === windowId);
</script>

<template>
  <div class="notepad">
    <NotepadHeader
      :_file-name="loadedFile?.fileName ?? ''"
      :file-is-loaded="fileIsLoaded"
      :file-id="loadedFile?.fileId ?? null"
      @on-save-changes="useSaveChanges(rayDb, $event, windowId, loadedFile)"
    />
    <div v-if="loadedFile" class="notepad-reader">
      <textarea v-model="loadedFile.text" contenteditable="true" />
    </div>
    <FileSelectButton
      v-else
      :window-id="windowId"
      :allowed-file-types="['text/plain']"
      @return-value="onFileSelectReturnValue"
    >text file</FileSelectButton>
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
