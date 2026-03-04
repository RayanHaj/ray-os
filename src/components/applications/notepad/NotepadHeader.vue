<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';

const { fileName } = defineProps<{ fileName: string }>();
const emit = defineEmits(['onSaveChanges']);

const fileNameRef = ref('');
onBeforeMount(() => {
  fileNameRef.value = fileName;
});

defineExpose({ fileName: fileNameRef });

const windowId = useInjectOrThrow<string>('windowId');
function onInput(event: InputEvent) {
  fileNameRef.value = (event.target as HTMLInputElement).value;
}

function onBlur(event: FocusEvent) {
  (event.target as HTMLParagraphElement).scrollLeft = 0;
}

function onSaveClick() {
  const sanitizedFileName = useSanitizeFileName(fileNameRef.value);
  console.log(sanitizedFileName)

  if (useValidateFileName(sanitizedFileName, windowId)) {
    emit('onSaveChanges');
  }
}
</script>

<template>
  <div
    class="notepad-header"
    :style="{
      pointerEvents: fileName === '' ? 'none' : 'auto',
      opacity: fileName === '' ? '0.5' : '1',
    }"
  >
    <input
      class="file-name"
      contenteditable="true"
      @input="onInput($event as InputEvent)"
      @blur="onBlur($event as FocusEvent)"
      :value="fileName"
    />
    <div class="buttons">
      <button class="save-edits-button button" @click="onSaveClick">save changes</button>
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
  height: 50px;
  background-color: var(--taskbar-background-color);
  color: var(--text-color);
}

.file-name {
  font-size: var(--font-size-elg);
  background-color: var(--input-primary-color);
  color: var(--text-color);
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
  color: var(--text-color);
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

@container notepadHeader (max-width: 440px) {
  .notepad-header {
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    height: fit-content;
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
