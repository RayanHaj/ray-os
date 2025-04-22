import type { BaseItem } from '@/types/BaseItem.ts'

export interface ApplicationItem extends BaseItem {
  type: 'application';
  iconImageName: string;
}
