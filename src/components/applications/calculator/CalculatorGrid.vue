<script setup lang="ts">
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';
import type { CalculatorKey } from '@/types/CalculatorTypes.ts';
import { inject } from 'vue';

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculationGridItems: CalculatorKey[] = [
  { visual: '%', value: '%', type: 'special' },
  { visual: 'CE', value: 'CE', type: 'special' },
  { visual: 'C', value: 'C', type: 'special' },
  { visual: '⌫', value: 'back', type: 'special' },

  { visual: '1/x', value: '1/x', type: 'special' },
  { visual: 'x²', value: 'x^2', type: 'special' },
  { visual: '√', value: '√', type: 'special' },
  { visual: '÷', value: '/', type: 'operator' },

  { visual: '7', value: 7, type: 'input' },
  { visual: '8', value: 8, type: 'input' },
  { visual: '9', value: 9, type: 'input' },
  { visual: '×', value: '*', type: 'operator' },

  { visual: '4', value: 4, type: 'input' },
  { visual: '5', value: 5, type: 'input' },
  { visual: '6', value: 6, type: 'input' },
  { visual: '−', value: '-', type: 'operator' },

  { visual: '1', value: 1, type: 'input' },
  { visual: '2', value: 2, type: 'input' },
  { visual: '3', value: 3, type: 'input' },
  { visual: '+', value: '+', type: 'operator' },

  { visual: '+/−', value: '+/-', type: 'special' },
  { visual: '0', value: 0, type: 'input' },
  { visual: '.', value: '.', type: 'input' },
  { visual: '=', value: '=', type: 'special' },
];

const calculatorManager = injectedCalculatorManager;
function onClickGridItem(key: CalculatorKey) {
  if (key.type === 'special') {
    calculatorManager.processSpecialKey(key);
    return;
  }

  calculatorManager.pushToCalculationArray({ value: key.value, type: key.type });
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
  color: var(--text-color);
  background: var(--button-primary-color);
  border: var(--window-border-color) 2px solid;
  height: 100%;
}

button:hover {
  background: var(--button-secondary-color);
}

.calculator-grid {
  display: grid;
  grid-template-columns: auto auto auto auto;
  height: 80%;
  width: 100%;
}
</style>
