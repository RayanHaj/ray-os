import type { Item, ItemType } from '@/types/itemTypes.ts';

export type TaskbarItem = { id: number, applicationId: number };
export type InsertTaskbarItem = { applicationId: number };
export type TaskbarTileItem = Item & { tileId: number };
export type DataTransferTaskbarItem = { id: number; type: string };
