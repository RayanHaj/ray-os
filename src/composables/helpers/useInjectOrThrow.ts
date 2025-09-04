import { inject } from 'vue';

/**
 * tries injecting a provided value. If it fails it will throw an error.
 * @param injectionString
 */
export function useInjectOrThrow<T>(injectionString: string) {
  const value = inject<T>(injectionString);

  if (!value) {
    throw new Error(`Injection of (${injectionString}) could not be processed`);
  }

  return value;
}
