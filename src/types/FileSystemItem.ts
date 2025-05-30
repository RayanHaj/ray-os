export type FileSystemItem = {
  parents: number[];
  file?: {
    name: string;
    id: number;
  };
  directory?: {
    name: string;
    children: number[];
  };
  id?: number;
};
