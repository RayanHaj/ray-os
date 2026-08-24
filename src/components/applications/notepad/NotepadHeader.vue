<script setup lang="ts">
import { computed, type Reactive, ref, type StyleValue, watch } from 'vue';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import type { FileItem, Item } from '@/types/itemTypes.js';
import { useWindowStore } from '@/stores/window.ts';
import type { NotepadFile } from '@/types/notepadTypes.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');

const { notepadFile, fileIsLoaded, pointerEventsDisabled, fileId } = defineProps<{
  notepadFile: Reactive<NotepadFile>;
  _fileName?: string;
  fileIsLoaded: boolean;
  pointerEventsDisabled: boolean;
  fileId: number | null;
}>();

const emit = defineEmits(['onSaveChanges']);

const windowStore = useWindowStore();
windowStore.windowControlClickSignal((windowControlSignal) => console.log(windowControlSignal));

const fileName = ref<string>('');
watch(() => notepadFile.fileName,
  (newFileName) => (fileName.value = newFileName ?? ''),
  { immediate: true },
);

function onFileNameInput(event: InputEvent) {
  fileName.value = (event.target as HTMLInputElement).value;
}

function onFileNameBlur(event: FocusEvent) {
  (event.target as HTMLParagraphElement).scrollLeft = 0;
}

async function handleExportFile() {
  if (!fileId) return;

  emit('onSaveChanges', fileName.value);

  const file = await rayDb.findOne<Item & { content: FileItem }>('files', 'id', fileId);

  const rawFile = file.content.rawFile;
  if (!rawFile) return;

  const objectUrl = URL.createObjectURL(rawFile);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName.value;
  a.click();

  URL.revokeObjectURL(objectUrl);
}

const notepadHeaderStyles = computed<StyleValue>(() => {
  return {
    pointerEvents: fileIsLoaded && !pointerEventsDisabled ? 'auto' : 'none',
    opacity: fileIsLoaded ? '1' : '0.5',
  };
});

defineExpose({
  fileName
});
</script>

<template>
  <div class="notepad-header" :style="notepadHeaderStyles">
    <input
      class="file-name"
      contenteditable="true"
      @input="onFileNameInput($event as InputEvent)"
      @blur="onFileNameBlur($event as FocusEvent)"
      :value="fileName"
    />
    <div class="buttons">
      <button class="button" @click="handleExportFile()">Export file</button>
      <button class="button" @click="emit('onSaveChanges', fileName)">save changes</button>
    </div>
  </div>
</template>

<style scoped>
.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 10px;
  width: 100%;
  height: var(--notepad-header-height);
  background-color: var(--taskbar-background-color);
}

.file-name {
  font-size: var(--font-size-elg);
  background-color: var(--input-primary-color);
  border: var(--input-border-color) 2px solid;
  padding-inline: 10px;
  padding-block: 3px;
  border-radius: 5px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-name:focus {
  overflow-x: auto;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  border-radius: 5px;
  padding-block: 5px;
  padding-inline: 10px;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.button:hover {
  border-color: var(--button-hover-color);
  background-color: var(--button-hover-color);
}

@container notepadMain (max-width: 550px) {
  .notepad-header {
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    height: var(--notepad-header-column-height);
  }

  .button,
  .buttons {
    width: 100%;
  }

  .file-name {
    width: 100%;
  }
}
</style>
