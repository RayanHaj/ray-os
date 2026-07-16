export const itemTypes = ['application', 'file', 'directory'] as const;
export type ItemType = (typeof itemTypes)[number];

export interface ApplicationItem {
  type: 'application';
}

export interface FileItem {
  type: 'file';
  name: string;
  size: number;
  createdAt: string;
  rawFile: File;
  imgUrl?: string;
}

export interface Item {
  label: string;
  content: ApplicationItem | FileItem | (FileSystemItem & { type: 'directory' });
  id: number;
  path?: string;
}

export interface ItemInsert {
  label: string;
  content: ApplicationItem | FileItem | (FileSystemItem & { type: 'directory' });
}

export type FileSystemItem = {
  id: number;
  parents: number[];
  file?: { name: string; id: number; type: string };
  directory?: { name: string; children: number[] };
  isSystemFile?: boolean;
  type?: string;
  path?: string;
};

export type InsertFileSystemItem = {
  id?: number;
  parents: number[];
  file?: { name: string; id: number; type: string };
  directory?: { name: string; children: number[] };
  isSystemFile?: boolean;
  type?: string;
};

export const fileExtensions = {
  'text/plain': 'txt',
  'video/mp4': 'mp4',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
} as const;

export const Applications = [
  'File Explorer',
  'Calculator',
  'Settings',
  'Terminal',
  'Notepad',
  'Audio Player',
  'Image Viewer',
  'Video Player',
  'Snake',
] as const;

export type Application = (typeof Applications)[number];
export type FileType = keyof typeof fileExtensions;

export const imageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const satisfies readonly FileType[];
export function isImageType(type: string | undefined): type is (typeof imageTypes)[number] {
  if (!type) return false;
  return imageTypes.includes(type as (typeof imageTypes)[number]);
}

export const videoTypes = ['video/mp4'] as const satisfies readonly FileType[];
export function isVideoType(type: string | undefined): type is (typeof videoTypes)[number] {
  if (!type) return false;
  return videoTypes.includes(type as (typeof videoTypes)[number]);
}

export const audioTypes = ['audio/mpeg'] as const satisfies readonly FileType[];
export function isAudioType(type: string | undefined): type is (typeof audioTypes)[number] {
  if (!type) return false;
  return audioTypes.includes(type as (typeof audioTypes)[number]);
}

export const textTypes = ['text/plain'];
export function isTextType(type: string | undefined): type is (typeof textTypes)[number] {
  if (!type) return false;
  return textTypes.includes(type as (typeof textTypes)[number]);
}
