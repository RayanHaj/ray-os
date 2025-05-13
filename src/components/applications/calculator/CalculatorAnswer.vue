<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculatorManager = injectedCalculatorManager;
const calculationString = ref('');

onMounted(() => {
  calculationString.value = calculatorManager.calculationArray.value[0].value.toString();
});
watch(
  () => calculatorManager.calculationArray.value,
  () => {
    calculationString.value = calculatorManager.calculationArray.value.reduce(
      (accumulator: string, value, currentIndex) => {
        accumulator +=
          value.type === 'operator' ||
          (value.type === 'input' &&
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
  <div class="calculator-answer-container">
    <p class="calculator-answer">{{ calculationString }}</p>
  </div>
</template>

<style scoped>
.calculator-answer-container {
  display: flex;
  align-items: center;
  justify-content: end;
  height: 20%;
  container: calculatorName / size;
}

.calculator-answer {
  color: var(--text-color);
  font-size: 55px;
  padding-right: 10px;
}

@container calculatorName (max-height: 80px) {
  .calculator-answer {
    font-size: 30px;
  }
}
</style>
