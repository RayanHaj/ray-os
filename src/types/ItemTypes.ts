export interface BaseItem {
  id: number;
  type: 'application' | 'file';
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
