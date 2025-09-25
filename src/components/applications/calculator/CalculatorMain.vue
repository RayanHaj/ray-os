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
  <section class="calculator">
    <div class="header">
      <button id="showHistoryButton" @click="historyToggled = !historyToggled">
        Show history
      </button>
    </div>
    <div
      v-show="!historyToggled"
      class="calculator-wrapper"
      :class="{ toggled: historyToggled }"
    >
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
    <div v-show="historyToggled" class="history-wrapper">
      <CalculatorHistory :history-toggled="historyToggled" />
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

.calculator-wrapper,
.history-wrapper {
  height: calc(100% - 70px);
}

#showHistoryButton {
  background: var(--button-primary-color);
  color: var(--text-color);
  border: var(--highlight-color) solid 2px;
  padding: 10px;
  height: 100%;
  border-radius: 5px;
  cursor: pointer;
}
</style>
