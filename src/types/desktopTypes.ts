import type { Item, ItemType } from '@/types/itemTypes.ts';

export type DesktopItem = { id: number; type: ItemType; tileId: number; path?: string };
export type DesktopTileItem = Item & { tileId: number };
export type DataTransferDesktopItem = { id: number; type: string };
