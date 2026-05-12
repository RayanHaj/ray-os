<script setup lang="ts">
import CalculatorAnswer from '@/components/applications/calculator/CalculatorAnswer.vue';
import CalculatorGrid from '@/components/applications/calculator/CalculatorGrid.vue';
import CalculatorHistory from '@/components/applications/calculator/CalculatorHistory.vue';
import { useCalculatorManager } from '@/composables/calculator/useCalculatorManager.ts';
import { provide, ref } from 'vue';
const historyToggled = ref(false);
provide('calculatorManager', useCalculatorManager());
</script>

<template>
  <div class="calculator">
    <div class="header">
      <button @click="historyToggled = !historyToggled">Show history</button>
    </div>
    <div v-if="historyToggled" class="history-wrapper">
      <CalculatorHistory :history-toggled="historyToggled" />
    </div>
    <div v-else class="calculator-wrapper">
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
  </div>
</template>

<style scoped>
* {
  color: white;
}

.calculator {
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  height: 70px;
  padding: 10px;
}

.header button {
  background: var(--button-primary-color);
  color: var(--text-color);
  border: var(--highlight-color) solid 2px;
  padding: 10px;
  height: 100%;
  border-radius: 5px;
  cursor: pointer;
}

.calculator-wrapper,
.history-wrapper {
  height: calc(100% - 70px);
}
</style>
