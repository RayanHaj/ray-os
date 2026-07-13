export type NotepadFile = { fileId: number; fileName: string; text: string };
export const createNotepadFile = (): NotepadFile => ({ fileId: -1, fileName: '', text: '' });
export type LoadedNotepadFile = {
  windowId: string;
  fileId: number;
  fileName: string;
  text: string;
};
