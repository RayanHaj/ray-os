export const primaryActionsContextMenu = ['Copy', 'Paste', 'Delete', 'Rename'] as const;
export type PrimaryActionsContextMenu = 'Copy' | 'Paste' | 'Delete' | 'Rename';
export type AllPrimaryActionsContextMenu = ['Copy', 'Paste', 'Delete', 'Rename'];
export type SecondaryActionsContextMenu = { id: string; label: string; disabled: boolean };
