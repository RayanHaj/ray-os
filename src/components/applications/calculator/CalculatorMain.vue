<script setup lang="ts">
import CalculatorAnswer from '@/components/applications/calculator/CalculatorAnswer.vue';
import CalculatorGrid from '@/components/applications/calculator/CalculatorGrid.vue';
import CalculatorHistory from '@/components/applications/calculator/CalculatorHistory.vue';
import { useCalculatorManager } from '@/composables/useCalculatorManager.ts';
import { provide } from 'vue';

provide('calculatorManager', useCalculatorManager());
</script>

<template>
  <div class="calculator">
    <div class="left-column">
      <CalculatorAnswer />
      <CalculatorGrid />
    </div>
    <div class="right-column">
      <CalculatorHistory />
    </div>
  </div>
</template>

<style scoped>
* {
  color: white;
}
.calculator {
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 30px);
}

.left-column {
  width: 70%;
}

.right-column {
  width: 30%;
  min-width: 20%;
}
</style>
