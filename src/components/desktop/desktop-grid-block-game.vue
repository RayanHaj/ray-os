<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="grid-container" ref="gridContainer">
    <div class="grid" ref="grid">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="numX" class="tile-column" ref="tileColumn">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="numY" class="tile" ref="tile"
             :id="indexX * GRID_HEIGHT + indexY"
             :style="{
              border: `${ '1px solid white' }`
            }">
          <div v-if="blockPositions.find(position => position.index === (indexX * GRID_HEIGHT + indexY))" class="tile-content-wrapper" ref="tileContentWrapper"
               :style="{width: `${TILE_WIDTH}px`, height: `${TILE_HEIGHT}px`, maxWidth: `${TILE_WIDTH}px`, maxHeight: `${TILE_HEIGHT}px`,
              backgroundColor: blockPositions.find(position => position.index === (indexX * GRID_HEIGHT + indexY)).backgroundColor}"
          >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {useGlobalState} from "@/stores/globalState";
import json from "@/assets/json/config.json"

export default {
  name: "desktop-grid-block-game",
  inject: ['db'],
  data() {
    return {
      GRID_WIDTH: 10,
      GRID_HEIGHT: 20,
      IMAGE_WIDTH: 30,
      IMAGE_HEIGHT: 30,
      TILE_WIDTH: 42,
      TILE_HEIGHT: 42,
      centerTileId: 0,
      currentBlockIndexes: [],
      blockPositions: [],
      bottomTileIds: [],
      isLoading: false,
      reachedBottom: false,
    }
  },
  emits: ['clicked'],
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  beforeMount() {
    this.isLoading = true;
  },
  async mounted() {
    await this.init().then(() => {
      this.centerTileId = Math.floor(this.GRID_WIDTH / 2) * this.GRID_HEIGHT;
      this.spawnPieceStartPos('OPiece', 'red');
    });
    setInterval(() => {
      const canMoveDown = this.movePiece(this.currentBlockIndexes, 'down');
      if (canMoveDown === false) {
        this.spawnPieceStartPos('TPiece', 'blue');
      }
    }, 200);
  },
  methods: {
    async init() {
      for (let i = 0; i < this.GRID_WIDTH * this.GRID_HEIGHT; i++) {
          this.blockPositions[i] = {
            'name': null,
            'index': i,
            'backgroundColor': null
          };
      }

      this.calculateBottomTileIds();
      this.showTileBorders = true;
      this.isLoading = false;
    },
    isTileFillable(index) {
      return this.desktopFiles[index] !== null &&
          this.desktopFiles[index] !== undefined &&
          this.desktopFiles[index]?.name !== null &&
          this.desktopFiles[index]?.imageUrl !== null;
    },
    calculateBottomTileIds() {
      for (let indexX = 0; indexX < this.GRID_WIDTH; indexX++) {
        this.bottomTileIds.push(indexX * this.GRID_HEIGHT + (this.GRID_HEIGHT - 1));
      }
    },
    tilesAreNotAccupied(positions) {
      let returnValue = true;
      positions.forEach(position => {
        if (this.blockPositions[this.centerTileId + position] && this.blockPositions[this.centerTileId + position].backgroundColor !== null) {
          returnValue = false;
        }
      });

      return returnValue;
    },
    spawnPieceStartPos(name, color) {
      const piece = json.blockPiecesPositions.find(piece => piece.name === name);
      const positions = piece.startPositions;
      const tilesAreNotOccupied = this.tilesAreNotAccupied(positions);
      if (tilesAreNotOccupied) {
        positions.forEach(position => {
          this.blockPositions[this.centerTileId + position].name = name;
          this.blockPositions[this.centerTileId + position].backgroundColor = color;
          this.currentBlockIndexes.push(this.blockPositions[this.centerTileId + position].index);
        });
      }
    },
    movePiece(indexes, direction) {
      if (this.pieceCanMoveDown(indexes) === false) {
        return false;
      }
      const removedPieces = this.removePiece(indexes);
      switch (direction) {
        case 'down': {
          removedPieces.forEach(piece => {
            this.blockPositions[piece.index + 1].name = piece.name;
            this.blockPositions[piece.index + 1].backgroundColor = piece.backgroundColor;
            this.currentBlockIndexes.push(piece.index + 1);
          });
          break;
        }
      }

      return true;
    },
    removePiece(indexes) {
      let returnArray = [];
      this.blockPositions.forEach(position => {
        if (indexes.includes(position.index)) {
          returnArray.push({
            name: position.name,
            index: position.index,
            backgroundColor: position.backgroundColor
          });
          position.name = null;
          position.backgroundColor = null;
        }
      });

      return returnArray;
    },
    pieceCanMoveDown(indexes) {
      let returnValue = true;
      this.blockPositions.forEach(position => {
        if (indexes.includes(position.index)) {
          const nextPos = this.blockPositions[position.index + 1];
          if (this.bottomTileIds.includes(this.blockPositions[position.index].index) ||
              (nextPos.backgroundColor !== null && !indexes.includes(nextPos.index))) {
            returnValue = false;
          }
        }
      });

      return returnValue;
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.grid {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}

.tile {
  display: flex;
  color: var(--font-color);
  user-select: none;
  overflow: hidden;
  width: 35px;
  height: 35px;
}

.tile-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>