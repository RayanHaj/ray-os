<script setup lang="ts">
import CalculatorAnswer from '@/components/applications/calculator/CalculatorAnswer.vue';
import CalculatorGrid from '@/components/applications/calculator/CalculatorGrid.vue';
import CalculatorHistory from '@/components/applications/calculator/CalculatorHistory.vue';
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';
import { provide, ref } from 'vue';
const historyIsToggled = ref(false);
provide('calculatorManager', useCalculatorManager());
</script>

<template>
  <CalculatorHistory :is-toggled="historyIsToggled" />
  <section class="calculator">
    <div class="header">
      <button id="showHistoryButton" @click="historyIsToggled = !historyIsToggled">
        Show history
      </button>
    </div>
    <div class="calculator-wrapper" :class="{ toggled: historyIsToggled }">
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
  </section>
</template>

<style scoped>
* {
  color: white;
}

.calculator {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 30px);
  overflow: auto;
}

.header {
  height: 50px;
}

.calculator-wrapper {
  height: calc(100% - 50px);
}

#showHistoryButton {
  background: var(--button-primary-color);
  color: var(--text-color);
  border: var(--highlight-color) solid 1px;
  padding: 10px;
  margin: 10px;
  height: 100%;
  cursor: pointer;
}
</style>
