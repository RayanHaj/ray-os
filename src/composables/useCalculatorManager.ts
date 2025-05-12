import { ref } from 'vue';
import type { CalculatorKey } from '@/types/CalculatorKey.ts';
type CalculationArray = CalculatorKey[];

export function useCalculatorManager() {
  const calculationArray = ref<CalculationArray>([{ value: 0, type: 'input' }]);

  const hasCalculated = ref(false);

  function pushToCalculationArray(currentKey: {
    value: number | string;
    type: 'input' | 'operator';
  }) {
    if (hasCalculated.value) {
      handleHasCalculated(currentKey);
    }

    const previousKey = calculationArray.value[calculationArray.value.length - 1];
    if (calculationArray.value.length === 1) {
      removeInitialZero(currentKey, previousKey);
    }

    if (calculationArray.value.length > 0) {
      const hasTrailingKeys = handleTrailingKeys(previousKey, currentKey);
      if (hasTrailingKeys) {
        return;
      }
    } else {
      if (currentKey.type === 'operator') {
        return;
      }
    }

    calculate();
    calculationArray.value = [...calculationArray.value, currentKey];
  }

  function removeInitialZero(currentKey: CalculatorKey, previousKey: CalculatorKey) {
    if (previousKey.value === 0) {
      if (currentKey.value === '.' || currentKey.type === 'operator') {
        return;
      }

      emptyCalculationLists(false);
    }
  }

  function checkCalculationStructure() {
    if (calculationArray.value.length < 3) {
      return;
    }

    const structure = ['input', 'operator', 'input'];
    return !calculationArray.value.some((key, index) => structure[index] !== key.type);
  }

  function handleTrailingKeys(previousKey: CalculatorKey, currentKey: CalculatorKey) {
    const isTrailingNumbers = previousKey.type === 'input' && currentKey.type === 'input';
    const isTrailingOperators = previousKey.type === 'operator' && currentKey.type === 'operator';

    let hasTrailingKeys = true;
    if (isTrailingNumbers) {
      onTrailingNumbers(previousKey, currentKey);
    } else if (isTrailingOperators) {
      onTrailingOperators(previousKey, currentKey);
    } else {
      if (previousKey.type !== 'input' && currentKey.value === '.') {
        currentKey.value = '0.';
      }

      hasTrailingKeys = false;
    }

    return hasTrailingKeys;
  }

  function handleHasCalculated(currentKey: CalculatorKey) {
    hasCalculated.value = false;
    if (calculationArray.value.length > 1) {
      return;
    }

    if (currentKey.type === 'input') {
      const elementIsDot = currentKey.value === '.';
      emptyCalculationLists(elementIsDot);
    }
  }

  function emptyCalculationLists(defaultValue: boolean) {
    calculationArray.value = defaultValue ? [{ value: 0, type: 'input' }] : [];
  }

  function onTrailingNumbers(previousKey: CalculatorKey, currentKey: CalculatorKey) {
    const previousKeyStr = String(previousKey.value);
    const currentKeyStr = String(currentKey.value);
    previousKey.value = previousKeyStr + currentKeyStr;
  }

  function onTrailingOperators(previousKey: CalculatorKey, currentKey: CalculatorKey) {
    if (previousKey.value === currentKey.value) {
      return;
    }

    calculationArray.value[calculationArray.value.length - 1] = currentKey;
  }

  function calculate() {
    let calculation = 0;
    if (!checkCalculationStructure()) {
      return;
    }

    calculationArray.value.forEach((currentKey, index) => {
      const previousKey = calculationArray.value[index - 1];
      if (typeof previousKey === 'undefined') {
        return;
      }

      if (currentKey.type === 'input' && previousKey.type === 'operator') {
        const currentNumber = Number(currentKey.value) as number;
        const operator = previousKey.value as string;

        calculation = processCalculation(calculation, currentNumber, operator);
      } else if (currentKey.type === 'operator' && previousKey.type === 'input') {
        calculation = Number(previousKey.value) as number;
      }
    });

    calculationArray.value = [{ value: Number(calculation.toFixed(3)), type: 'input' }];
    hasCalculated.value = true;
  }

  function processCalculation(calculation: number, currentNumber: number, operator: string) {
    let calculationValue = 0;
    switch (operator) {
      case '+':
        calculationValue = calculation + currentNumber;
        break;
      case '-':
        calculationValue = calculation - currentNumber;
        break;
      case '/':
        calculationValue = calculation / currentNumber;
        break;
      case '*':
        calculationValue = calculation * currentNumber;
    }

    return calculationValue;
  }

  return {
    calculate,
    calculationArray,
    pushToCalculationArray,
  };
}
