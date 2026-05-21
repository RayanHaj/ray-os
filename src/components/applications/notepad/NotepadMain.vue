<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useSaveChanges } from '@/composables/notepad/useSaveChanges.ts';

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

const fileExplorerWindowId = ref<string>();
function handleSelectTextFile() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(windowId, nextFileExplorerId, [
    'text/plain',
  ]);

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (newReturnValue) => {
    const selectedReturnValue = newReturnValue.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!selectedReturnValue) return;

    // If it is of type 'object' then it should be a FileItem
    if (typeof selectedReturnValue.value === 'object' && selectedReturnValue.value.rawFile) {
      if (!fileExplorerWindowId.value) return;

      const rawFileText = await selectedReturnValue.value.rawFile.text();

      useNotepadStore().initializeNotepadFile(
        windowId,
        selectedReturnValue.fileId,
        selectedReturnValue.value.name,
        rawFileText,
      );

      useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
    }
  },
);

const fileExplorerWindowIsOpen = computed(() =>
  useWindowStore().openWindowsReferences['File Explorer']?.some(
    (reference) =>
      useWindowStore().getWindowId('File Explorer', reference.id) === fileExplorerWindowId.value,
  ),
);

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
    <div v-else class="select-text-file">
      <div class="select-text-file-wrapper">
        <button @click="handleSelectTextFile" :disabled="fileExplorerWindowIsOpen">
          <span>
            <component :is="useSvgOrFallback('Upload').svg" />
            Click to select a text file
          </span>
        </button>
      </div>
    </div>
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
  color: var(--text-color);
  height: calc(100% - var(--notepad-header-height));
  overflow: auto;
  resize: none;
  background: none;
  border: none;
}

.select-text-file {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  max-height: calc(100% - var(--notepad-header-height));
  height: 100%;
  overflow: hidden;
}

.select-text-file .notepad-header {
  justify-self: start;
}

.select-text-file-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.select-text-file-wrapper button {
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

.select-text-file-wrapper span {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
}

.select-text-file-wrapper svg {
  width: 50px;
  height: 50px;
}

@container notepadMain (max-width: 550px) {
  .select-text-file {
    max-height: calc(100% - var(--notepad-header-column-height));
  }

  .notepad-reader textarea {
    width: 100%;
    padding: 10px;
    color: var(--text-color);
    height: calc(100% - var(--notepad-header-column-height));
    overflow: auto;
    resize: none;
    background: none;
    border: none;
  }
}

@container notepadMain (max-height: 290px) {
  .select-text-file-wrapper button {
    font-size: var(--font-size-sm);
  }
  .select-text-file-wrapper svg {
    width: 25px;
    height: 25px;
  }
}
</style>
