export function useProcessCalculation(
  accumulator: number,
  currentNumber: number,
  operator: string,
) {
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
