<script setup lang="ts">
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';
import type { CalculatorKey } from '@/types/CalculatorKey.ts';
import { inject } from 'vue';

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculationGridItems: CalculatorKey[] = [
  { visual: '%', value: '%', category: 'special' },
  { visual: 'CE', value: 'CE', category: 'special' },
  { visual: 'C', value: 'C', category: 'special' },
  { visual: '⌫', value: 'back', category: 'special' },

  { visual: '1/x', value: '1/x', category: 'special' },
  { visual: 'x²', value: 'x^2', category: 'special' },
  { visual: '√', value: '√', category: 'special' },
  { visual: '÷', value: '/', category: 'operator' },

  { visual: '7', value: 7, category: 'input' },
  { visual: '8', value: 8, category: 'input' },
  { visual: '9', value: 9, category: 'input' },
  { visual: '×', value: '*', category: 'operator' },

  { visual: '4', value: 4, category: 'input' },
  { visual: '5', value: 5, category: 'input' },
  { visual: '6', value: 6, category: 'input' },
  { visual: '−', value: '-', category: 'operator' },

  { visual: '1', value: 1, category: 'input' },
  { visual: '2', value: 2, category: 'input' },
  { visual: '3', value: 3, category: 'input' },
  { visual: '+', value: '+', category: 'operator' },

  { visual: '+/−', value: '+/-', category: 'special' },
  { visual: '0', value: 0, category: 'input' },
  { visual: '.', value: '.', category: 'input' },
  { visual: '=', value: '=', category: 'special' },
];

const calculatorManager = injectedCalculatorManager;
function onClickGridItem(key: CalculatorKey) {
  if (key.type === 'special') {
    calculatorManager.processSpecialKey(key);
    return;
  }

  calculatorManager.pushToCalculationArray({ value: key.value, category: key.type });
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
