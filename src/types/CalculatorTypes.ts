export interface CalculatorKey {
  visual?: string | number;
  value: string | number;
  type: 'input' | 'operator' | 'special';
}
