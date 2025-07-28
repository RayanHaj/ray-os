export interface Toast {
  message: string;
  type: ToastTypes;
  milliseconds: number;
}

export interface TimeoutId {
  toastIndex: number;
  id: number;
}

export type ToastTypes = 'success' | 'warning' | 'error';
