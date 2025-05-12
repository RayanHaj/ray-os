<script setup lang="ts">
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';
import { inject } from 'vue';

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

type GridItem = {
  visual?: string | number;
  value: string | number;
  type: 'number' | 'operator';
};
const calculationGridItems: GridItem[] = [
  { visual: '%', value: '%', type: 'operator' },
  { visual: 'CE', value: 'CE', type: 'operator' },
  { visual: 'C', value: 'C', type: 'operator' },
  { visual: '⌫', value: 'back', type: 'operator' },

  { visual: '1/x', value: '1/x', type: 'operator' },
  { visual: 'x²', value: 'x^2', type: 'operator' },
  { visual: '√', value: '√', type: 'operator' },
  { visual: '÷', value: '/', type: 'operator' },

  { visual: '7', value: 7, type: 'number' },
  { visual: '8', value: 8, type: 'number' },
  { visual: '9', value: 9, type: 'number' },
  { visual: '×', value: '*', type: 'operator' },

  { visual: '4', value: 4, type: 'number' },
  { visual: '5', value: 5, type: 'number' },
  { visual: '6', value: 6, type: 'number' },
  { visual: '−', value: '-', type: 'operator' },

  { visual: '1', value: 1, type: 'number' },
  { visual: '2', value: 2, type: 'number' },
  { visual: '3', value: 3, type: 'number' },
  { visual: '+', value: '+', type: 'operator' },

  { visual: '+/−', value: '+/-', type: 'operator' },
  { visual: '0', value: 0, type: 'number' },
  { visual: '.', value: '.', type: 'number' },
  { visual: '=', value: '=', type: 'operator' },
];

const calculatorManager = injectedCalculatorManager;
function onClickGridItem(gridItem: GridItem) {
  if (gridItem.value === '=') {
    calculatorManager.calculate();
  } else if (gridItem.value === 'C') {
    calculatorManager.calculationArray.value = [];
  } else {
    calculatorManager.pushElementToCalculationArray({ value: gridItem.value, type: gridItem.type });
  }
}
</script>

<template>
  <div class="calculator-grid">
    <button
      v-for="item of calculationGridItems"
      :key="item.value"
      class="grid-item"
      @click="onClickGridItem(item)"
    >
      {{ item.visual }}
    </button>
  </div>
</template>

<style scoped>
button {
  font-size: 20px;
}
.calculator-grid {
  display: grid;
  grid-template-columns: auto auto auto auto;
  height: 80%;
}
</style>
