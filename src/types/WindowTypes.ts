export interface WindowReference {
  id: number;
  zIndex: number;
  minimized: boolean;
}
export interface WindowFlatReference {
  id: number;
  label: string;
  zIndex: number;
  minimized: boolean;
}
export type WindowStyleObject = {
  left: string;
  top: string;
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  zIndex: number;
  display: string;
  cursor: string;
  transition: string;
};
