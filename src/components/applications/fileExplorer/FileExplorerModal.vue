<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ModalAction, ModalContentType } from '@/types/fileExplorerTypes.js';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { title, action, fileSystemItemTitle } = defineProps<{
  title: ModalContentType;
  action: ModalAction;
  fileSystemItemTitle: string;
}>();

const input = ref('');
const emits = defineEmits(['modalEvent:submitClick', 'modalEvent:cancelClick']);

const arrowRightSvg = useSvgOrFallback('ArrowRight');

const inputFieldRef = ref();
onMounted(() => {
  if (!inputFieldRef.value) return;
  (inputFieldRef.value as HTMLInputElement).focus();
});

function onClickSubmit() {
  emits('modalEvent:submitClick', { contentType: title, action: action, input: input.value });
  input.value = '';
}

function onClickCancel() {
  emits('modalEvent:cancelClick');
  input.value = '';
}
</script>

<template>
  <div class="modal-container" @keyup.enter="onClickSubmit">
    <div class="modal">
      <h2>{{ `${action[0].toUpperCase()}${action.slice(1)}` }} {{ title }}</h2>
      <div v-if="action === 'rename'" class="current-title-wrapper">
        <p>{{ fileSystemItemTitle }}</p>
        <component
          class="arrow-right-svg"
          :is="arrowRightSvg.svg"
          :custom-width="35"
          :custom-height="35"
        />
      </div>
      <div class="input-wrapper">
        <label for="inputField">{{ `Enter ${title} name` }}</label>
        <input ref="inputFieldRef" id="inputField" type="text" v-model="input" />
      </div>
      <div class="buttons">
        <button class="submit-button" @click="onClickSubmit">submit</button>
        <button class="cancel-button" @click="onClickCancel">cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  z-index: 9998;
}

.current-title-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.current-title-wrapper p {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 20px;
  border-radius: 5px;
  max-width: 90%;
  font-size: var(--font-size-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-right-svg {
  width: max-content;
}

.modal {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  width: 300px;
  height: 250px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--tabs-background);
  border: var(--window-border-color) solid 2px;
  border-radius: 10px;
  padding: 10px;
  gap: 5px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cancel-button {
  width: 100%;
  height: 40px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: var(--window-border-color) 1px solid;
  background: var(--button-primary-color);
  color: var(--text-secondary-color);
}

.cancel-button:hover,
.submit-button:hover {
  background: var(--button-hover-color);
}

.submit-button {
  width: 100%;
  height: 40px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border: var(--window-border-color) 1px solid;
  background: var(--button-primary-color);
  font-weight: bold;
}

#inputField {
  background: var(--input-primary-color);
  border: var(--input-border-color) 1px solid;
  padding: 7px;
  width: 100%;
  border-radius: 5px;
}

#inputField:focus {
  border: var(--input-focus-color) 1px solid;
  outline: var(--input-focus-color) 1px solid;
  outline-offset: -1px;
  box-shadow: none;
}

@container fileExplorer (max-width: 400px) {
  .modal {
    width: calc(100% - 10px);
  }
}
</style>
