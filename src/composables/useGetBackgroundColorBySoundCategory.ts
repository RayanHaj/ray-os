import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';

export function useGetBackgroundColorBySoundCategory(category: AllowedSoundCategories) {
  switch (category) {
    case 'water':
      return { background: '#0077B6', font: '#00B4D8' };
    case 'fire':
      return { background: '#FF4500', font: '#FFD700' };
  }
}
