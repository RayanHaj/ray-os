<template>
  <section class="grid">
    <div v-for="(numX, indexX) in GRID_WIDTH" :key="numX" class="tile-column">
      <tile-component
          v-for="(numY, indexY) in GRID_HEIGHT"
          :key="numY"
          :x-position="indexX"
          :y-position="indexY"
          :snake-position="snakePosition"
          :fruit-position="fruitPosition"
      />
    </div>
  </section>
</template>

<script>
import TileComponent from "@/components/window/content/games/snakeGame/components/TileComponent.vue";
import config from "@/components/window/content/games/snakeGame/config/snakeGameConfig.json"

export default {
  name: "grid-component",
  components: {TileComponent},
  data() {
    return {
      GRID_WIDTH: config.GRID_WIDTH,
      GRID_HEIGHT: config.GRID_HEIGHT,
      lastMove: null,
      snakePosition: [
        {
          x: 1,
          y: 10
        },
        {
          x: 2,
          y: 10
        },
        {
          x: 3,
          y: 10
        },
        {
          x: 4,
          y: 10
        },
        {
          x: 5,
          y: 10
        }
      ],
      fruitPosition: [
        {
          x: 18,
          y: 18
        }
      ]
    }
  },
  mounted() {
    window.addEventListener('keydown', this.move);
    // setInterval(() => {
    //   this.snakePosition = this.snakePosition.map(position => {
    //     return {
    //       x: position.x += 1,
    //       y: position.y
    //     }
    //   });
    // }, 500)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.move)
  },
  methods: {
    move(event) {
      switch(event.key) {
        case 'ArrowUp': {
          this.moveUp();
        } break;
        case 'ArrowRight': {
          this.moveRight();
        } break;
        case 'ArrowLeft': {
          this.moveLeft();
        } break;
        case 'ArrowDown': {
          this.moveDown();
        } break;
      }
    },
    moveUp() {
      if (this.lastMove === 'down') return;
      this.snakePosition = this.snakePosition.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x,
            y: position.y - 1
          };
        } else {
          return {
            x: this.snakePosition[index - 1].x,
            y: this.snakePosition[index - 1].y
          };
        }
      });

      this.lastMove = 'up';
    },
    moveDown() {
      if (this.lastMove === 'up') return;
      this.snakePosition = this.snakePosition.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x,
            y: position.y + 1
          };
        } else {
          return {
            x: this.snakePosition[index - 1].x,
            y: this.snakePosition[index - 1].y
          };
        }
      });

      this.lastMove = 'down';
    },
    moveRight() {
      if (this.lastMove === 'left') return;
      this.snakePosition = this.snakePosition.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x + 1,
            y: position.y
          };
        } else {
          return {
            x: this.snakePosition[index - 1].x,
            y: this.snakePosition[index - 1].y
          };
        }
      });

      this.lastMove = 'right';
    },
    moveLeft() {
      if (this.lastMove === 'right') return;
      this.snakePosition = this.snakePosition.map((position, index) => {
        if (index === 0) {
          return {
            x: position.x - 1,
            y: position.y
          };
        } else {
          return {
            x: this.snakePosition[index - 1].x,
            y: this.snakePosition[index - 1].y
          };
        }
      });

      this.lastMove = 'left';
    }
  }
}
</script>

<style scoped>
.grid {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}
</style>