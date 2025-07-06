import { ref } from 'vue';
import type { CalculatorKey, SpecialKey } from '@/types/CalculatorTypes.ts';
import { specialKeys } from '@/types/CalculatorTypes.ts';
import { useProcessCalculation } from '@/composables/calculator/useProcessCalculation.ts';

type CalculationArray = CalculatorKey[];

export function useCalculatorManager() {
  const defaultCalculation: CalculatorKey = { visual: '0', value: '0', type: 'input' };
  const calculationArray = ref<CalculationArray>([defaultCalculation]);
  const calculationHistory = ref<{ calculationString: string; calculationAnswer: string }[]>([]);

  const hasCalculated = ref(false);

  function pushToCalculationArray(currentKey: CalculatorKey) {
    if (hasCalculated.value) {
      handleHasCalculated(currentKey);
    }

    if (hasOnlyZero()) {
      removeInitialZero(currentKey);
    }

    if (calculationArray.value.length === 0) {
      if (currentKey.type === 'operator') {
        return;
      }
    } else {
      const previousKey: CalculatorKey = calculationArray.value[calculationArray.value.length - 1];

      const hasTrailingKeys = handleTrailingKeys(currentKey, previousKey);
      if (hasTrailingKeys) {
        return;
      }

      if (isEndingOnDot(currentKey, previousKey)) {
        const dotRemovedKeyValue = previousKey.value.slice(0, previousKey.value.length - 1);
        updateKeyValue(calculationArray.value.length - 1, dotRemovedKeyValue);
      }
      if (isStartingOnDot(currentKey, previousKey)) {
        currentKey.value = '0.';
        currentKey.visual = '0.';
      }
    }

    const couldCalculate = calculate();
    if (!couldCalculate) {
      calculationArray.value = [...calculationArray.value, currentKey];
    }
  }

  function removeInitialZero(currentKey: CalculatorKey) {
    const previousKey: CalculatorKey = calculationArray.value[calculationArray.value.length - 1];
    if (previousKey.value === '0') {
      if (currentKey.value === '.' || currentKey.type === 'operator') {
        return;
      }

      emptyCalculationArray(false);
    }
  }

  function checkCalculationStructure() {
    if (calculationArray.value.length < 3) {
      return;
    }

    const structure = ['input', 'operator', 'input'];
    return !calculationArray.value.some((key, index) => structure[index] !== key.type);
  }

  function handleTrailingKeys(currentKey: CalculatorKey, previousKey: CalculatorKey) {
    const isTrailingInputs = previousKey.type === 'input' && currentKey.type === 'input';
    const isTrailingOperators = previousKey.type === 'operator' && currentKey.type === 'operator';

    if (isTrailingInputs) {
      onTrailingInputs(previousKey, currentKey);
      return true;
    }

    if (isTrailingOperators) {
      onTrailingOperators(previousKey, currentKey);
      return true;
    }

    return false;
  }

  function isEndingOnDot(currentKey: CalculatorKey, previousKey: CalculatorKey) {
    return (
      previousKey.value.length > 1 &&
      previousKey.value.endsWith('.') &&
      (currentKey.type === 'operator' || currentKey.type === 'special')
    );
  }

  function isStartingOnDot(currentKey: CalculatorKey, previousKey: CalculatorKey) {
    return previousKey.type !== 'input' && currentKey.value === '.';
  }

  function handleHasCalculated(currentKey: CalculatorKey) {
    hasCalculated.value = false;
    if (calculationArray.value.length > 1) {
      return;
    }

    if (currentKey.type === 'input') {
      const elementIsDot = currentKey.value === '.';
      emptyCalculationArray(elementIsDot);
    }
  }

  function onTrailingInputs(previousKey: CalculatorKey, currentKey: CalculatorKey) {
    const concatenatedInputs = previousKey.visual + currentKey.visual;
    const { index } = getLastCalculationKeyAndIndex();
    updateKeyValue(index, concatenatedInputs);
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
      return false;
    }

    calculationArray.value.forEach((currentKey, index) => {
      const previousKey = calculationArray.value[index - 1];
      if (typeof previousKey === 'undefined') {
        return;
      }

      if (currentKey.type === 'input' && previousKey.type === 'operator') {
        const currentNumber = Number(currentKey.value);
        const operator = previousKey.value;

        calculation = useProcessCalculation(calculation, currentNumber, operator);
      } else if (currentKey.type === 'operator' && previousKey.type === 'input') {
        calculation = Number(previousKey.value);
      }
    });

    const calculationAnswer = Number(calculation.toFixed(3)).toString();
    calculationHistory.value = [
      ...calculationHistory.value,
      {
        calculationString: calculationArray.value.map((key) => key.value).join(' '),
        calculationAnswer: calculationAnswer,
      },
    ];

    calculationArray.value = [
      {
        visual: roundNumberToTenDecimals(calculationAnswer),
        value: calculationAnswer,
        type: 'input',
      },
    ];
    hasCalculated.value = true;
    return true;
  }

  function removeLastKey() {
    if (calculationArray.value.length === 0) {
      return;
    }

    const lastKey = calculationArray.value[calculationArray.value.length - 1];
    const lastKeyAsString = lastKey.value.toString() as string;
    if (lastKey.type === 'input' && lastKeyAsString.length > 1) {
      lastKey.value = lastKeyAsString.slice(0, lastKeyAsString.length - 1);
    } else {
      calculationArray.value.splice(calculationArray.value.length - 1, 1);
    }

    if (calculationArray.value.length === 0) {
      calculationArray.value[0] = defaultCalculation;
    }

    hasCalculated.value = false;
  }

  function handleSquareRoot() {
    const lastKey = calculationArray.value[calculationArray.value.length - 1];
    if (lastKey.type === 'input') {
      lastKey.value = Math.sqrt(Number(lastKey.value)).toString();
    }
  }

  function handleSignToggle() {
    const lastKey = calculationArray.value[calculationArray.value.length - 1];
    if (lastKey.type === 'input') {
      lastKey.value = (Number(lastKey.value) * -1).toString();
    }
  }

  function handlePercentage() {
    const { index, key } = getLastCalculationKeyAndIndex();
    if (key.type === 'input') {
      if (checkCalculationStructure()) {
        const firstKey = Number(calculationArray.value[0].value);
        const calc = (firstKey - firstKey / Number(key.value)).toString();
        updateKeyValue(index, calc);
        calculate();
        return;
      }

      const calculation = (Number(key.value) / 100).toString();
      updateKeyValue(index, calculation);
    } else if (key.type === 'operator') {
      const firstKey = calculationArray.value[0];
      if (firstKey.type === 'input') {
        const calculation = Number(firstKey.value) / 100;
        pushToCalculationArray({
          visual: calculation.toString(),
          value: calculation.toString(),
          type: firstKey.type,
        });
        calculate();
      }
    }
  }

  function emptyCalculationArray(addDefaultZeroValue: boolean) {
    calculationArray.value = addDefaultZeroValue ? [defaultCalculation] : [];
  }

  function handleClearEntry() {
    if (hasOnlyZero()) {
      return;
    }

    if (calculationArray.value.length === 1) {
      emptyCalculationArray(true);
      return;
    }

    calculationArray.value = calculationArray.value.filter(
      (_, index) => index !== calculationArray.value.length - 1,
    );
  }

  function handleDivisionByOne() {
    const { index, key } = getLastCalculationKeyAndIndex();
    if (key.type === 'input') {
      const calculation = (1 / Number(key.value)).toString();
      updateKeyValue(index, calculation);
    }
  }

  function handlePow() {
    const { index, key } = getLastCalculationKeyAndIndex();
    if (key.type === 'input') {
      const calculation = Math.pow(Number(key.value), 2).toString();
      updateKeyValue(index, calculation);
    }
  }

  function getLastCalculationKeyAndIndex() {
    const index = calculationArray.value.length - 1;
    const key = calculationArray.value[index];
    return { index, key };
  }

  function updateKeyValue(keyIndex: number, value: string) {
    calculationArray.value[keyIndex] = {
      ...calculationArray.value[keyIndex],
      visual: roundNumberToTenDecimals(value),
      value: value,
    };
  }

  function roundNumberToTenDecimals(value: string): string {
    if (isNaN(Number(value)) || value.endsWith('.')) {
      return value;
    }

    return (Math.round(Number(value) * 10000000000) / 10000000000).toString();
  }

  function hasOnlyZero() {
    const { index, key } = getLastCalculationKeyAndIndex();
    return index === 0 && key.value.toString() === '0';
  }

  function processSpecialKey(key: SpecialKey) {
    switch (key) {
      case specialKeys.EQUAL:
        calculate();
        break;
      case specialKeys.CLEAR:
        emptyCalculationArray(true);
        break;
      case specialKeys.CLEAR_ENTRY:
        handleClearEntry();
        break;
      case specialKeys.BACK:
        removeLastKey();
        break;
      case specialKeys.SQUARE_ROOT:
        handleSquareRoot();
        break;
      case specialKeys.SIGN_CHANGE:
        handleSignToggle();
        break;
      case specialKeys.PERCENTAGE:
        handlePercentage();
        break;
      case specialKeys.DIVISION_BY_ONE:
        handleDivisionByOne();
        break;
      case specialKeys.SQUARED:
        handlePow();
    }
  }

  function returnCalculationString() {
    return calculationArray.value
      .map((key, index) => {
        const addTrailingWhitespace =
          key.type === 'operator' ||
          (key.type === 'input' && calculationArray.value[index - 1]?.type === 'operator');
        return addTrailingWhitespace ? ` ${key.visual}` : key.visual;
      })
      .join(' ');
  }

  return {
    calculationArray,
    calculationHistory,
    hasCalculated,
    pushToCalculationArray,
    processSpecialKey,
    returnCalculationString,
  };
}
