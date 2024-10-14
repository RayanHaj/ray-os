<template>
  <div :class="theme">
    <RouterView @theme-changed="updateTheme"/>
  </div>
</template>

<script>

export default {
  name: 'App',
  mounted() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      this.theme = theme;
    }
  },
  data() {
    return {
      theme: 'default',
    }
  },
  methods: {
    updateTheme() {
      const theme = localStorage.getItem('theme');
      if (theme) {
        this.theme = theme;
      }
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  width: 100vw;
  height: 100vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

.default {
  --background-color: #000000;
  --footer-color: #000000;
  --background-color-window: #242F36;
  --background-color-input: #2f4f4f;
  --font-color: #FFFFFFFF;
  --hover-color: #2c3e50;
}

.blue-sea {
  --background-color: #04ADBF;
  --footer-color: #024959;
  --background-color-window: #0D1440;
  --background-color-input: #04ADBF;
  --font-color: #FFFFFFFF;
  --hover-color: #006370;
}
</style>
