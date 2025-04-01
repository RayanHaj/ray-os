<template>
  <section class="grid">
    <div v-for="(numX, indexX) in GRID_WIDTH" :key="numX" class="tile-column">
      <tile-component
          v-for="(numY, indexY) in GRID_HEIGHT"
          :key="numY"
          :x-position="indexX"
          :y-position="indexY"
          :snake="snake"
          :fruits="fruits"
      />
    </div>
  </section>
</template>

<script>
import TileComponent from "@/components/window/content/games/snakeGame/components/TileComponent.vue";
import config from "@/components/window/content/games/snakeGame/config/snakeGameConfig.json"
import {Snake} from "@/components/window/content/games/snakeGame/models/snake";
import {Fruit} from "@/components/window/content/games/snakeGame/models/fruit";

export default {
  name: "grid-component",
  components: {TileComponent},
  data() {
    return {
      GRID_WIDTH: config.GRID_WIDTH,
      GRID_HEIGHT: config.GRID_HEIGHT,
      currentMove: null,
      previousMove: null,
      currentIntervalId: null,
      snake: null,
      fruits: null,
      isMoving: false,
      handlingMovesInQueue: false
    }
  },
  beforeMount() {
    this.initGame();
  },
  mounted() {
    this.gameLoop();
    window.addEventListener('keydown', this.onKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyPress)
  },
  watch: {
  },
  methods: {
    initGame() {
      this.currentMove = 'right';
      this.previousMove = null;
      this.snake = new Snake([{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}, {x: 2, y: 10}, {x: 1, y: 10},],
          'black',
          'green'
      )

      this.fruits = [
        new Fruit([{x: 18, y: 18}], 'blue'),
        new Fruit([{x: 18, y: 17}], 'yellow'),
        new Fruit([{x: 18, y: 16}], 'red'),
        new Fruit([{x: 18, y: 15}], 'orange')
      ]
    },
    onKeyPress(event) {
      {
        const key = event.key.slice(5).toLowerCase();

        if (key === this.currentMove) {
          return;
        }

        if (this.isMoving === false) {
          this.isMoving = true;
          this.previousMove = this.currentMove;
          this.currentMove = key;
        }
      }
    },
    colliderChecker(newPosition) {
      const positionContainsSnake = this.snake.positions.some(position => (position.x === newPosition.x && position.y === newPosition.y));
      const positionContainsFruitIndex = this.fruits.findIndex(fruit => {
        return fruit.positions.some(position => (position.x === newPosition.x && position.y === newPosition.y));
      })

      if (positionContainsSnake) {
        this.initGame();
        return;
      }

      if (positionContainsFruitIndex !== -1) {
        const copy = [...this.snake.positions]
        copy.push({x: 0, y: 0});

        this.snake.positions = copy;
        this.fruits.splice(positionContainsFruitIndex, 1)
      }
    },
    gameLoop() {
      clearInterval(this.currentIntervalId);
      this.currentIntervalId = setInterval(() => {
        this.move(this.currentMove);
        if (this.isMoving) {
          this.isMoving = false;
        }
      }, config.GAME_SPEED.fast)
    },
    move(direction) {
      switch (direction) {
        case 'up': {
          this.moveUp();
        }
          break;
        case 'right': {
          this.moveRight();
        }
          break;
        case 'left': {
          this.moveLeft();
        }
          break;
        case 'down': {
          this.moveDown();
        }
          break;
      }
    },
    moveUp() {
      if (this.previousMove === 'down') return;
      const headPos = {
        x: this.snake.positions[0].x,
        y: this.snake.positions[0].y - 1
      };
      this.colliderChecker(headPos);
      this.snake.positions = this.snake.positions.map((position, index) => {
        if (index === 0) {
          return headPos;
        } else {
          return {
            x: this.snake.positions[index - 1].x,
            y: this.snake.positions[index - 1].y
          };
        }
      });
    },
    moveDown() {
      if (this.previousMove === 'up') return;
      const headPos = {
        x: this.snake.positions[0].x,
        y: this.snake.positions[0].y + 1
      };
      this.colliderChecker(headPos);
      this.snake.positions = this.snake.positions.map((position, index) => {
        if (index === 0) {
          return headPos
        } else {
          return {
            x: this.snake.positions[index - 1].x,
            y: this.snake.positions[index - 1].y
          };
        }
      });
    },
    moveRight() {
      if (this.previousMove === 'left') return;
      const headPos = {
        x: this.snake.positions[0].x + 1,
        y: this.snake.positions[0].y
      };
      this.colliderChecker(headPos);
      this.snake.positions = this.snake.positions.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x + 1,
            y: position.y
          };
        } else {
          return {
            x: this.snake.positions[index - 1].x,
            y: this.snake.positions[index - 1].y
          };
        }
      });
    },
    moveLeft() {
      if (this.previousMove === 'right') return;
      const headPos = {
        x: this.snake.positions[0].x - 1,
        y: this.snake.positions[0].y
      };
      this.colliderChecker(headPos);
      this.snake.positions = this.snake.positions.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x - 1,
            y: position.y
          };
        } else {
          return {
            x: this.snake.positions[index - 1].x,
            y: this.snake.positions[index - 1].y
          };
        }
      });
    }
  }
}
</script>

<style scoped>
.grid {
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
  border: white 10px solid;
  border-radius: 10px;
  background-size: cover;
  background: #141e30;
  background: -webkit-linear-gradient(to right, #141e30, #243b55);
  background: linear-gradient(to right, #141e30, #243b55);
}
</style>