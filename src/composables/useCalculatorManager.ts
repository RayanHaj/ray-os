import { ref } from 'vue';

type Calculation = {
  [calculationId: number]: { calculationAnswer: number; calculationArray: CalculationArray };
};
type CalculationArray = { value: number | string; type: 'number' | 'operator' }[];

export function useCalculatorManager() {
  const calculationId = ref(-1);
  const calculationAnswer = ref(0);
  const calculationArray = ref<CalculationArray>([]);
  const calculationHistory = ref<Calculation>({});

  const hasCalculated = ref(false);

  function pushElementToCalculationArray(currentElement: {
    value: number | string;
    type: 'number' | 'operator';
  }) {
    const previousElement = calculationArray.value[calculationArray.value.length - 1];

    if (calculationArray.value.length > 0) {
      const isTrailingNumbers =
        previousElement.type === 'number' && currentElement.type === 'number';
      const isTrailingOperators =
        previousElement.type === 'operator' && currentElement.type === 'operator';

      if (previousElement.type === 'number' && currentElement.value === '√') {
        calculate();
        return;
      }

      if (isTrailingNumbers) {
        joinTrailingNumbers(previousElement, currentElement);
        return;
      }

      if (isTrailingOperators) {
        const i = calculationArray.value.length - 1;
        calculationArray.value[i] = currentElement;
        return;
      }
    } else {
      if (firstValueIsOperator(currentElement)) {
        return;
      }
    }

    if (calculationArray.value.length === 3) {
      if (previousElement.type === 'number' && currentElement.type === 'operator') {
        calculate();
      }
    }

    calculationArray.value = [...calculationArray.value, currentElement];
  }

  function firstValueIsOperator(element: { value: number | string; type: 'number' | 'operator' }) {
    if (calculationArray.value.length === 0) {
      if (element.type === 'operator') {
        return true;
      }
    }
    return false;
  }

  function joinTrailingNumbers(
    lastElement: {
      value: number | string;
      type: 'number' | 'operator';
    },
    element: {
      value: number | string;
      type: 'number' | 'operator';
    },
  ) {
    const lastStr = String(lastElement.value);
    const currentStr = String(element.value);
    lastElement.value = lastStr + currentStr;
  }

  function removeLastElementInCalculationArray() {
    if (calculationArray.value.length === 0) {
      return;
    }

    calculationArray.value = calculationArray.value.filter(
      (_, index) => index !== calculationArray.value.length - 1,
    );
  }

  function emptyCalculation() {
    calculationArray.value = [];
    calculationAnswer.value = 0;
  }

  function calculate() {
    let calculation = 0;
    calculationArray.value.forEach((element, index) => {
      const previousElement = calculationArray.value[index - 1];
      if (typeof previousElement === 'undefined' || previousElement.type === element.type) {
        return false;
      }

      if (element.type === 'number' && previousElement.type === 'operator') {
        const number = Number(element.value) as number;
        const operator = previousElement.value as string;

        calculation = processCalculation(number, operator, calculation);
      } else if (previousElement.type === 'number' && element.type === 'operator') {
        calculation = previousElement.value as number;
      }
    });

    calculationId.value += 1;
    calculationHistory.value[calculationId.value] = {
      calculationAnswer: calculationAnswer.value,
      calculationArray: calculationArray.value,
    };
    calculationAnswer.value = calculation;
    calculationArray.value = [{ value: calculation, type: 'number' }];
    hasCalculated.value = true;
    return calculationAnswer.value;
  }

  function processCalculation(number: number, operator: string, calculation: number) {
    let finalNumber = 0;
    switch (operator) {
      case '+':
        finalNumber = calculation + number;
        break;
      case '-':
        finalNumber = calculation - number;
        break;
      case '/':
        finalNumber = calculation / number;
        break;
      case '*':
        finalNumber = calculation * number;
        break;
      case '√':
        finalNumber = Math.sqrt(number);
    }

    return finalNumber;
  }

  return {
    calculate,
    calculationAnswer,
    calculationArray,
    pushElementToCalculationArray,
    removeLastElementInCalculationArray,
  };
}
