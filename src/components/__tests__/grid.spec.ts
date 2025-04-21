import type { Tile } from '@/types/Tile.ts'
import { useGridStore } from '@/stores/grid.ts'
import { test, expect } from 'vitest'

function generateTiles(count: number): Tile[] {
  const tiles = [];
  for (let i = 1; i < count; i++) {
    tiles.push({
      id: i,
      iconUrl: `@/assets/icons/icon${i}.png`,
      label: `app${i}`
    });
  }

  return tiles;
}

const tiles = generateTiles(10);
const gridStore = useGridStore();

test("Tiles can be pushed into grid", () => {
  expect(gridStore.tiles.length).toBe(0);

  tiles.forEach(tile => {
    gridStore.tiles.push(tile);
  });

  expect(gridStore.tiles.length).toBe(10);
});
