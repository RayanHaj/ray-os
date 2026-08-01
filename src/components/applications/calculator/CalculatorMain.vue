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
      <button class="show-history-button" @click="historyToggled = !historyToggled">
        Show history
      </button>
    </div>
    <div v-show="!historyToggled" class="calculator-wrapper" :class="{ toggled: historyToggled }">
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
    <div v-show="historyToggled" class="history-wrapper">
      <CalculatorHistory :history-toggled="historyToggled" />
    </div>
  </section>
</template>

<style scoped>
.calculator {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header {
  height: 70px;
  padding: 10px;
  max-width: 1000px;
  width: 100%;
}

.calculator-wrapper,
.history-wrapper {
  height: calc(100% - 70px);
  max-width: 1000px;
  width: 100%;
}

.show-history-button {
  background: var(--button-primary-color);
  border: var(--highlight-color) solid 2px;
  padding: 10px;
  height: 100%;
  border-radius: 5px;
}
</style>
