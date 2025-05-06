import type { ApplicationItem } from '@/types/ApplicationItem.ts';
import type { FileItem } from '@/types/FileItem.ts';

export interface Item {
  label: string;
  content: ApplicationItem | FileItem;
}
