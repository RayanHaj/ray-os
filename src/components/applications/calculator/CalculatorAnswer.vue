<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculatorManager = injectedCalculatorManager;
const calculationString = ref('');
watch(
  () => calculatorManager.calculationArray.value,
  () => {
    calculationString.value = calculatorManager.calculationArray.value.reduce(
      (accumulator: string, value, currentIndex) => {
        accumulator +=
          value.type === 'operator' ||
          (value.type === 'number' &&
            calculatorManager.calculationArray.value[currentIndex - 1]?.type === 'operator')
            ? ` ${value.value}`
            : value.value;
        return accumulator;
      },
      '',
    );
  },
  { deep: true },
);
</script>

<template>
  <div class="calculator-answer">{{ calculationString }}</div>
</template>

<style scoped>
.calculator-answer {
  display: flex;
  align-items: center;
  justify-content: end;
  height: 20%;
  font-size: 55px;
}
</style>
