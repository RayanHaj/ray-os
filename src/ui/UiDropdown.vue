<script setup lang="ts">
import { type CSSProperties, onBeforeMount, ref } from 'vue';

const emit = defineEmits(['dropdown:value']);

const { options, defaultValue, customStylesSelect, customStylesOptions } = defineProps<{
  options: string[];
  defaultValue?: string;
  customStylesSelect?: Partial<CSSProperties>;
  customStylesOptions?: Partial<CSSProperties>;
}>();

const selectedOption = ref<string>('');
onBeforeMount(() => {
  selectedOption.value = defaultValue ?? options[0];
});
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
      <option
        :style="customStylesOptions"
        v-for="option of options"
        :key="option"
        :selected="selectedOption === option"
      >
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
