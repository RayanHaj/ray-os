import type { Item } from '@/types/itemTypes.ts';

export type DesktopTileItem = Item & { tileId: number };
export type DataTransferDesktopItem = { id: number; type: string };
