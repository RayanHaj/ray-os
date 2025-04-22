import type { ApplicationItem } from '@/types/ApplicationItem.ts'
import type { FileItem } from '@/types/FileItem.ts'

export interface BaseItem {
  id: number;
  type: 'application' | 'file';
}

export type Item = ApplicationItem | FileItem
