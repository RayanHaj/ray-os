<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useCalculatorManager } from '@/composables/calculator/useCalculatorManager.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';

const calculatorManager =
  useInjectOrThrow<ReturnType<typeof useCalculatorManager>>('calculatorManager');

const calculationString = ref<string>('');
onMounted(() => {
  calculationString.value = calculatorManager.calculationArray.value[0].visual;
});

watch(
  calculatorManager.calculationArray,
  () => {
    calculationString.value = calculatorManager.returnCalculationString();
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
  font-size: var(--font-size-huge);
  padding-right: 10px;
}

@container calculatorName (max-height: 80px) {
  .calculator-answer {
    font-size: var(--font-size-eelg);
  }
}
</style>
