export const itemTypes = ['application', 'file'] as const;
export type ItemType = typeof itemTypes[number]

export interface BaseItem {
  id: number;
  type: ItemType;
}

export interface ApplicationItem extends BaseItem {
  type: 'application';
}

export interface FileItem extends BaseItem {
  type: 'file';
  name: string;
  size: number;
  createdAt: string;
  imgUrl?: string;
  rawFile?: File;
}

export interface Item {
  label: string;
  content: ApplicationItem | FileItem;
}

export type FileSystemItem = {
  parents: number[];
  file?: { name: string; id: number };
  directory?: { name: string; children: number[] };
  id?: number;
};

export const fileExtensions = {
  'text/plain': 'txt',
  'video/mp4': 'mp4',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
} as const;

export const Applications = [
  'File Explorer',
  'Calculator',
  'Serene Sounds',
  'Settings',
  'Terminal',
  'Paint',
  'Portfolio',
  'Todo',
] as const;
export type Application = (typeof Applications)[number];

export type FileTypes = keyof typeof fileExtensions;
export type FileExtension = (typeof fileExtensions)[FileTypes];
