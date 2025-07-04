<script setup lang="ts">
import type { CSSProperties } from 'vue';

type test = string[];

const emit = defineEmits(['dropdown:value']);

const { options, customStylesSelect, customStylesOptions } = defineProps<{
  options: test;
  customStylesSelect?: Partial<CSSProperties>;
  customStylesOptions?: Partial<CSSProperties>;
}>();

function handleSelectedOption(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (!target) {
    return;
  }

  emit('dropdown:value', target.value);
}
</script>
<template>
  <div class="dropdown">
    <select :style="customStylesSelect" @change="handleSelectedOption($event)">
      <option :style="customStylesOptions" v-for="option of options" :key="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>
<style scoped>
  select {
    width: 100%;
    height: 30px;
    border: var(--input-border-color) 1px solid;
    font-size: var(--font-size-elg);
    color: var(--text-color);
    background-color: var(--input-primary-color);
    border-radius: 5px;
  }

  option:checked {
    background-color: var(--input-secondary-color);
  }

  option:focus {
    color: red;
  }
</style>
