<script setup lang="ts">
import { ref } from 'vue';

defineProps({ title: { required: true, type: String } });

const input = ref('');
const emits = defineEmits(['modalEvent:submitClick', 'modalEvent:cancelClick']);

function onClickSubmit() {
  emits('modalEvent:submitClick', input.value);
  input.value = '';
}

function onClickCancel() {
  emits('modalEvent:cancelClick');
  input.value = '';
}
</script>

<template>
  <div class="modal-container">
    <div class="modal">
      <h2>{{ title }}</h2>
      <div class="input-wrapper">
        <label for="inputField">directory</label>
        <input id="inputField" type="text" v-model="input" />
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

.modal {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--text-color);
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
  color: var(--text-color);
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
  color: var(--text-color);
}

#inputField {
  background: var(--input-primary-color);
  border: var(--input-border-color) 1px solid;
  color: var(--text-color);
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
</style>
