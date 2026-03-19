<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useSaveChanges } from '@/composables/notepad/useSaveChanges.ts';

const notepadStore = useNotepadStore();
const toastStore = useToastStore();
const windowId = useInjectOrThrow<string>('windowId');

onBeforeUnmount(() => toastStore.closeToastsByWindowId(windowId));

const loadedFile = ref<{ windowId: string; fileId: number; fileName: string; text: string }>();

watchEffect(() => {
  if (notepadStore.loadedFile?.windowId !== windowId) {
    return;
  }

  loadedFile.value = notepadStore.loadedFile;
  notepadStore.loadedFile = undefined;
});

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const notepadHeader = ref();

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
  <div class="notepad-container">
    <NotepadHeader
      ref="notepadHeader"
      :file-name="loadedFile?.fileName ?? ''"
      @on-save-changes="useSaveChanges(rayDb, notepadHeader.fileName, windowId, loadedFile)"
    />
    <div class="notepad-reader" v-if="loadedFile">
      <textarea class="reader" v-model="loadedFile.text" contenteditable="true" />
    </div>
    <div class="open-text-file-section" v-else>
      <div class="open-text-file-block">
        <button
          class="select-text-file-button"
          @click="handleUploadClick"
          :disabled="fileExplorerWindowIsOpen"
        >
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
.notepad-container {
  background-color: var(--background-color);
  position: relative;
  container: notepadHeader / size;
  overflow: hidden !important;
}

.reader {
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
.notepad-reader {
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
  padding: 10px;
  border-radius: 10px;
}

*:focus {
  outline: none;
}
</style>
