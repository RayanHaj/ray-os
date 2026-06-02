<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { useCalculatorManager } from '@/composables/calculator/useCalculatorManager.ts';

defineProps({ historyToggled: { required: true, type: Boolean, default: false } });

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculationHistory = ref<{ calculationString: string; calculationAnswer: string }[]>([]);
watch(
  () => injectedCalculatorManager.calculationHistory.value,
  (newValue) => {
    calculationHistory.value.push(newValue[newValue.length - 1]);
  },
);
</script>

<template>
  <div v-show="historyToggled" class="calculator-history">
    <ul>
      <li v-if="calculationHistory.length === 0">No history items found</li>
      <li
        v-else
        v-for="(calculation, index) of calculationHistory"
        :key="`${index}-${calculation.calculationAnswer}`"
      >
        <p id="calculation">{{ calculation.calculationString }} =</p>
        <p id="answer">{{ calculation.calculationAnswer }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.calculator-history {
  position: relative;
  width: 100%;
  padding: 5px;
  overflow: auto;
}

ul {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  overflow: auto;
}

li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background-color: var(--input-primary-color);
  border: var(--window-border-color) solid 2px;
  list-style: none;
  container: calculation / inline-size;
}

#answer,
#calculation {
  font-weight: bold;
  font-size: var(--font-size-elg);
}

@container calculation (max-width: 120px) {
  #answer,
  #calculation {
    font-size: var(--font-size-md);
  }
}
</style>
