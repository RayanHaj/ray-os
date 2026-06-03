export interface CalculatorKey {
  visual: string;
  value: string;
  type: 'input' | 'operator' | 'special';
}

export const specialKeys = {
  EQUAL: '=',
  CLEAR: 'C',
  CLEAR_ENTRY: 'CE',
  BACK: 'back',
  SQUARE_ROOT: '√',
  SIGN_CHANGE: '+/-',
  PERCENTAGE: '%',
  DIVISION_BY_ONE: '1/x',
  SQUARED: 'x^2',
} as const;

export type SpecialKey = (typeof specialKeys)[keyof typeof specialKeys];
