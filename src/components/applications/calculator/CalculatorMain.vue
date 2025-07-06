<script setup lang="ts">
import CalculatorAnswer from '@/components/applications/calculator/CalculatorAnswer.vue';
import CalculatorGrid from '@/components/applications/calculator/CalculatorGrid.vue';
import CalculatorHistory from '@/components/applications/calculator/CalculatorHistory.vue';
import { useCalculatorManager } from '@/composables/calculator/useCalculatorManager.ts';
import { provide, ref } from 'vue';
const historyIsToggled = ref(false);
provide('calculatorManager', useCalculatorManager());
</script>

<template>
  <section class="calculator">
    <div class="header">
      <button id="showHistoryButton" @click="historyIsToggled = !historyIsToggled">
        Show history
      </button>
    </div>
    <div v-show="!historyIsToggled" class="calculator-wrapper" :class="{ toggled: historyIsToggled }">
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
    <div v-show="historyIsToggled" class="history-wrapper">
      <CalculatorHistory :is-toggled="historyIsToggled" />
    </div>
  </section>
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

.calculator-wrapper, .history-wrapper {
  height: calc(100% - 70px);
}

#showHistoryButton {
  background: var(--button-primary-color);
  color: var(--text-color);
  border: var(--highlight-color) solid 2px;
  padding: 10px;
  height: 100%;
  border-radius: 7px;
  cursor: pointer;
}
</style>
