import type { Item } from '@/types/Item.ts';

export interface ChildParentOperation {
  identifier: string;
  type: string;
  value: Item;
}
