import type { Item } from '@/types/itemTypes.ts';

export type TaskbarItem = { id: number, applicationId: number };
export type InsertTaskbarItem = { applicationId: number };
export type TaskbarTileItem = Item & { tileId: number, temp?: boolean };
export type DataTransferTaskbarItem = { id: number; type: string };
