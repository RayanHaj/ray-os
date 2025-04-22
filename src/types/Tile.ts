import type { ApplicationItem } from '@/types/ApplicationItem.ts'
import type { FileItem } from '@/types/FileItem.ts'

export interface Tile {
  label: string,
  content: ApplicationItem | FileItem
}
