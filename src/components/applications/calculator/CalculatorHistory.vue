<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { useCalculatorManager } from '@/composables/useCalculatorManager.ts';

defineProps({
  isToggled: {
    required: true,
    category: Boolean,
    default: false,
  },
});

const injectedCalculatorManager =
  inject<ReturnType<typeof useCalculatorManager>>('calculatorManager');
if (!injectedCalculatorManager) {
  throw Error('calculator manager not injected');
}

const calculationHistory = ref<{ calculationString: string; calculationAnswer: number }[]>([]);
watch(
  () => injectedCalculatorManager.calculationHistory.value,
  (newValue) => {
    calculationHistory.value.push(newValue[newValue.length - 1]);
  },
);
</script>

<template>
  <transition name="slide">
    <div v-show="isToggled" class="calculator-history">
      <ul>
        <li v-if="calculationHistory.length === 0">No history items found</li>
        <li
          v-else
          v-for="(calculation, index) of calculationHistory"
          :key="`${index}-${calculation.calculationAnswer}`"
        >
          <p id="calculation">{{ calculation.calculationString }} =</p>
          <p id="answer">{{ calculation.calculationAnswer }}</p>
        </li>
      </ul>
    </div>
  </transition>
</template>

<style scoped>
.calculator-history {
  position: absolute;
  top: 50%;
  height: 50%;
  width: 100%;
  padding: 5px;
  overflow: auto;
  border: var(--window-border-color) solid 2px;
  background: var(--highlight-color);
}
ul {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  overflow: auto;
}
li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background-color: var(--input-primary-color);
  border: var(--window-border-color) solid 2px;
  list-style: none;
  container: calculation / inline-size;
}

#answer,
#calculation {
  color: var(--text-color);
  font-weight: bold;
  font-size: 20px;
}

@container calculation (max-width: 120px) {
  #answer,
  #calculation {
    font-size: 12px;
  }
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
</style>
