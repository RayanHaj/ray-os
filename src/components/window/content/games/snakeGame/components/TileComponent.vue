<template>
  <section class="tile" ref="tile" :style="{ border: `1px solid white` }">

  </section>
</template>

<script>
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
    snakePosition: {
      type: Array,
      required: true
    },
    fruitPosition: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.updatePosition(this.snakePosition, 'snake');
    this.updatePosition(this.fruitPosition, 'fruit');
  },
  watch: {
    snakePosition(newPosition) {
      if (this.$refs.tile.classList.contains('snake')) {
        this.$refs.tile.style.backgroundColor = '';
      }
      this.updatePosition(newPosition,'snake');
    },
    fruitPosition(newPosition) {
      if (this.$refs.tile.classList.contains('fruit')) {
        this.$refs.tile.style.backgroundColor = '';
      }
      this.updatePosition(newPosition,'fruit');
    }
  },
  methods: {
    updatePosition(positions, type) {
      const tileAtPosition = positions.some(position => position.x === this.xPosition && position.y === this.yPosition);
      if (tileAtPosition) {
        switch (type) {
          case 'snake': {
            this.$refs.tile.style.backgroundColor = 'green';
            this.$refs.tile.classList.add('snake');
          } break;
          case 'fruit': {
            this.$refs.tile.style.backgroundColor = 'red';
            this.$refs.tile.classList.add('fruit');
          } break;
        }
      }
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