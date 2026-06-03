export interface Toast {
  message: string;
  type: ToastTypes;
  milliseconds: number;
  location: 'window' | 'desktop';
  windowId?: string;
}

export interface TimeoutId {
  toastIndex: number;
  id: number;
}

export type ToastTypes = 'success' | 'warning' | 'error';
