import type { BaseItem } from '@/types/BaseItem.ts';

export interface FileItem extends BaseItem {
  type: 'file';
  name: string;
  size: number;
  createdAt: string;
  imgUrl?: string;
  rawFile?: File;
}
