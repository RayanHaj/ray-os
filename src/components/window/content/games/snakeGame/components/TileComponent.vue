<template>
  <section class="tile" ref="tile"/>
</template>

<script>
import {Snake} from "@/components/window/content/games/snakeGame/models/snake";

export default {
  name: "tile-component",
  props: {
    xPosition: {
      type: Number,
      required: true
    },
    yPosition: {
      type: Number,
      required: true
    },
    snake: {
      type: Snake,
      required: true
    },
    fruits: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.updateTile(this.snake, 'snake');

    this.fruits.forEach(fruit => {
      this.updateTile(fruit, 'fruit');
    })
  },
  computed: {
    snakePositions() {
      return this.snake.positions;
    }
  },
  watch: {
    snakePositions(newPositions, oldPositions) {
      if (JSON.stringify(newPositions) === JSON.stringify(oldPositions)) {
        return;
      }
      if (this.$refs.tile.classList.contains('snake')) {
        this.$refs.tile.style.backgroundColor = '';
      }

      this.updateTile(this.snake, 'snake');
    },
    fruits(newFruits) {
      if (this.$refs.tile.classList.contains('fruit')) {
        this.$refs.tile.style.backgroundColor = '';
      }

      newFruits.forEach(fruit => {
        this.updateTile(fruit, 'fruit');
      })
    }
  },
  methods: {
    updateTile(entity, type) {
      const tileAtPosition = entity.positions.findIndex(position => position.x === this.xPosition && position.y === this.yPosition);
      if (tileAtPosition !== -1) {
        this.$refs.tile.classList.add(type);
        this.$refs.tile.style.backgroundColor = tileAtPosition === 0 && type === 'snake' ? entity.headColor : entity.color;
        return;
      }

      this.$refs.tile.classList.remove(type);
    }
  }
}
</script>

<style scoped>
.tile {
  display: flex;
  user-select: none;
  overflow: hidden;
  width: 20px;
  height: 20px;
}
</style>