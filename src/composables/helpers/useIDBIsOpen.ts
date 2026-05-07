import type { RayDb } from 'ray-db-wrapper';

export function useIDBIsOpen(rayDb: RayDb) {
  let open = true;
  try {
    rayDb.db().transaction('');
  } catch (e) {
    if ((e as Error).name === 'InvalidStateError') {
      open = false;
    }
  }
  return open;
}
