import { useToastStore } from '@/stores/toast.ts';

export function useToastFeatureNotImplemented() {
  useToastStore().createToast('feature not completed yet', 'warning', 1000, 'desktop');
}
