<script setup lang="ts">
import { ref } from 'vue';

const emits = defineEmits(['selectedOption']);

const options = ref(['themes']);
const selectedOption = ref('themes');

function onClickOption(option: string) {
  selectedOption.value = option;
  emits('selectedOption', selectedOption.value);
}
</script>

<template>
  <div class="sidebar">
    <button
      class="option"
      :class="{ selected: selectedOption === option }"
      v-for="option of options"
      :key="option"
      @click="onClickOption(option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 5px;
  height: 100%;
  background: var(--accent-color);
}

.option {
  background: var(--button-primary-color);
  border: none;
  color: var(--text-color);
  border-radius: 2px;
  width: 200px;
  height: 40px;
}

.option.selected {
  background: var(--button-secondary-color);
}
</style>
