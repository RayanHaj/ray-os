import { ref } from 'vue';
import type { CalculatorKey } from '@/types/CalculatorTypes.ts';

type CalculationArray = CalculatorKey[];

export function useCalculatorManager() {
  const defaultCalculation: CalculatorKey = { visual: '0', value: 0, type: 'input' };
  const calculationArray = ref<CalculationArray>([defaultCalculation]);
  const calculationHistory = ref<{ calculationString: string; calculationAnswer: number }[]>([]);

  const hasCalculated = ref(false);
  function pushToCalculationArray(currentKey: CalculatorKey) {
    if (hasCalculated.value) {
      handleHasCalculated(currentKey);
    }

    if (hasOnlyZero()) {
      removeInitialZero(currentKey);
    }

    if (calculationArray.value.length > 0) {
      if (handleTrailingDot(currentKey)) {
        return;
      }
    }

    let hasTrailingKeys = false;
    if (calculationArray.value.length > 0) {
      hasTrailingKeys = handleTrailingKeys(currentKey);
    } else {
      if (currentKey.type === 'operator') {
        return;
      }
    }

    if (hasTrailingKeys) {
      return;
    }

    calculate();
    calculationArray.value = [...calculationArray.value, currentKey];
  }

  function handleTrailingDot(currentKey: CalculatorKey) {
    const previousKey: CalculatorKey = calculationArray.value[calculationArray.value.length - 1];
    return previousKey.value.toString().includes('.') && currentKey.value.toString().includes('.');
  }

  function removeInitialZero(currentKey: CalculatorKey) {
    const previousKey: CalculatorKey = calculationArray.value[calculationArray.value.length - 1];
    if (previousKey.value === 0) {
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

  function handleTrailingKeys(currentKey: CalculatorKey) {
    const previousKey: CalculatorKey = calculationArray.value[calculationArray.value.length - 1];
    const isTrailingInputs = previousKey.type === 'input' && currentKey.type === 'input';
    const isTrailingOperators = previousKey.type === 'operator' && currentKey.type === 'operator';

    let hasTrailingKeys = true;
    if (isTrailingInputs) {
      onTrailingInputs(previousKey, currentKey);
    } else if (isTrailingOperators) {
      onTrailingOperators(previousKey, currentKey);
    } else {
      if (previousKey.type !== 'input' && currentKey.value === '.') {
        currentKey.value = '0.';
        currentKey.visual = '0.';
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

    const calculationAnswer = Number(calculation.toFixed(3));
    calculationHistory.value = [
      ...calculationHistory.value,
      {
        calculationString: calculationArray.value.map((key) => key.value).join(' '),
        calculationAnswer: calculationAnswer,
      },
    ];

    calculationArray.value = [
      { visual: calculationAnswer.toString(), value: calculationAnswer, type: 'input' },
    ];
    hasCalculated.value = true;
  }

  function processCalculation(accumulator: number, currentNumber: number, operator: string) {
    switch (operator) {
      case '+':
        return accumulator + currentNumber;
      case '-':
        return accumulator - currentNumber;
      case '/':
        return accumulator / currentNumber;
      case '*':
        return accumulator * currentNumber;
      default:
        return accumulator;
    }
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
      lastKey.value = Math.sqrt(Number(lastKey.value));
    }
  }

  function handleSignToggle() {
    const lastKey = calculationArray.value[calculationArray.value.length - 1];
    if (lastKey.type === 'input') {
      lastKey.value = Number(lastKey.value) * -1;
    }
  }

  function handlePercentage() {
    const { index, key } = getLastCalculationKeyAndIndex();
    if (key.type === 'input') {
      if (checkCalculationStructure()) {
        const firstKey = Number(calculationArray.value[0].value);
        const calc = firstKey - (firstKey / Number(key.value));
        console.log(firstKey / Number(key.value))
        updateKeyValue(index, calc);
        console.log(calculationArray.value)
        calculate();
        return;
      }

      const calculation = Number(key.value) / 100;
      updateKeyValue(index, calculation);
    } else if (key.type === 'operator') {
      const firstKey = calculationArray.value[0];
      if (firstKey.type === 'input') {
        const calculation = (Number(firstKey.value)) / 100;
        pushToCalculationArray({ visual: calculation.toString(), value: calculation.toString(), type: firstKey.type });
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
      const calculation = (key.value = 1 / Number(key.value));
      updateKeyValue(index, calculation);
    }
  }

  function handlePow() {
    const { index, key } = getLastCalculationKeyAndIndex();
    if (key.type === 'input') {
      const calculation = Math.pow(Number(key.value), 2);
      updateKeyValue(index, calculation);
    }
  }

  function getLastCalculationKeyAndIndex() {
    const index = calculationArray.value.length - 1;
    const key = calculationArray.value[index];
    return { index, key };
  }

  function updateKeyValue(keyIndex: number, value: number | string) {
    calculationArray.value[keyIndex] = {
      ...calculationArray.value[keyIndex],
      visual: value.toString(),
      value: value,
    };
  }

  function hasOnlyZero() {
    const { index, key } = getLastCalculationKeyAndIndex();
    return index === 0 && key.value.toString() === '0';
  }

  function processSpecialKey(key: CalculatorKey) {
    switch (key.value) {
      case '=':
        calculate();
        break;
      case 'C':
        emptyCalculationArray(true);
        break;
      case 'CE':
        handleClearEntry();
        break;
      case 'back':
        removeLastKey();
        break;
      case '√':
        handleSquareRoot();
        break;
      case '+/-':
        handleSignToggle();
        break;
      case '%':
        handlePercentage();
        break;
      case '1/x':
        handleDivisionByOne();
        break;
      case 'x^2':
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
    pushToCalculationArray,
    processSpecialKey,
    returnCalculationString,
  };
}
