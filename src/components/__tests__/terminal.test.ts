import { describe, test, expect } from 'vitest';
import { parseCommandStringToArray } from '@/composables/terminal/useHandleTerminalCommand.ts';

describe('parseCommandStringToArray', () => {
  test('splitst commando zonder argument', () => {
    expect(parseCommandStringToArray('help')).toEqual(['help']);
  });

  test('splitst commando met argument', () => {
    expect(parseCommandStringToArray('cd    ..   ')).toEqual(new Error('error'));
  });

  test('verwijdert extra spaties', () => {
    expect(parseCommandStringToArray('  cd   folder  ')).toEqual(['cd', 'folder']);
  });

  test('herkent commando cd..', () => {
    expect(parseCommandStringToArray('cd..')).toEqual(['cd..']);
  });

  test('gaat correct om met onbekend commando', () => {
    expect(parseCommandStringToArray('foobar')).toEqual(['foobar']);
  });
});
