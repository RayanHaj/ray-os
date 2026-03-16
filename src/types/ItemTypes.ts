export const itemTypes = ['application', 'file', 'directory'] as const;
export type ItemType = typeof itemTypes[number]

export interface ApplicationItem {
  type: 'application';
}

export interface FileItem {
  type: 'file';
  name: string;
  size: number;
  createdAt: string;
  imgUrl?: string;
  rawFile?: File;
}

export interface Item {
  label: string;
  content: ApplicationItem | FileItem | FileSystemItem & { type: 'directory', path: string[], id: number };
  id: number;
}

export interface ItemInsert {
  label: string;
  content: ApplicationItem | FileItem | FileSystemItem & { type: 'directory', path: string[], id: number };
}

export type FileSystemItem = {
  parents: number[];
  file?: { name: string; id: number };
  directory?: { name: string; children: number[] };
  id?: number;
  isSystemFile?: boolean
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
  'Notepad',
  'Doom'
] as const;
export type Application = (typeof Applications)[number];

export type FileType = keyof typeof fileExtensions;
export type FileExtension = (typeof fileExtensions)[FileType];
