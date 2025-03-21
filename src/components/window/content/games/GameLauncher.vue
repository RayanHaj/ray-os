<template>
  <section class="game-launcher">
    <snake-game></snake-game>
  </section>
</template>

<script>
import SnakeGame from "@/components/window/content/games/snakeGame/SnakeGame.vue";

export default {
  name: "game-launcher",
  components: {SnakeGame}
}
</script>

<style scoped>
.game-launcher {
  width: 100%;
  height: 100%;
}

snake-game {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>