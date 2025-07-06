// import { useProcessCalculation } from '@/composables/calculator/useProcessCalculation.ts';
// import { useInjectOrThrow } from '@/composables/useInjectOrThrow.ts';
//
// export function useCalculate() {
//   const calcuuseInjectOrThrow('calculationArray');
//   let calculation = 0;
//   if (!checkCalculationStructure()) {
//     return false;
//   }
//
//   calculationArray.value.forEach((currentKey, index) => {
//     const previousKey = calculationArray.value[index - 1];
//     if (typeof previousKey === 'undefined') {
//       return;
//     }
//
//     if (currentKey.type === 'input' && previousKey.type === 'operator') {
//       const currentNumber = Number(currentKey.value);
//       const operator = previousKey.value;
//
//       calculation = useProcessCalculation(calculation, currentNumber, operator);
//     } else if (currentKey.type === 'operator' && previousKey.type === 'input') {
//       calculation = Number(previousKey.value);
//     }
//   });
//
//   const calculationAnswer = Number(calculation.toFixed(3)).toString();
//   calculationHistory.value = [
//     ...calculationHistory.value,
//     {
//       calculationString: calculationArray.value.map((key) => key.value).join(' '),
//       calculationAnswer: calculationAnswer,
//     },
//   ];
//
//   calculationArray.value = [
//     {
//       visual: roundNumberToTenDecimals(calculationAnswer),
//       value: calculationAnswer,
//       type: 'input',
//     },
//   ];
//   hasCalculated.value = true;
//   return true;
// }
