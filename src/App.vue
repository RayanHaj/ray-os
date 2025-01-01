<template>
  <div :class="theme">
    <RouterView @update-settings="updateSettings"/>
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
    updateSettings() {
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
  --taskbar-color: #000000;
  --background-color-window: #242F36;
  --background-color-input: #2f4f4f;
  --font-color: #FFFFFFFF;
  --hover-color: #2c3e50;
}

.blue-sea {
  --background-color: #04ADBF;
  --taskbar-color: #024959;
  --background-color-window: #0D1440;
  --background-color-input: #04ADBF;
  --font-color: #FFFFFFFF;
  --hover-color: #006370;
}

.sunset-beach {
  --background-color: #FF6F61;
  --taskbar-color: #D03F27;
  --background-color-window: #FFCCB6;
  --background-color-input: #FF6F61;
  --font-color: #333333;
  --hover-color: #E65C3D;
}

.forest-dream {
  --background-color: #2E5B2A;
  --taskbar-color: #1C3F1A;
  --background-color-window: #A3CBA0;
  --background-color-input: #2E5B2A;
  --font-color: #FFFFFF;
  --hover-color: #4F7A4C;
}

.cyberpunk-night {
  --background-color: #1E1E2F;
  --taskbar-color: #0F0F1A;
  --background-color-window: #3D3D6B;
  --background-color-input: #2B2B4D;
  --font-color: #00FFCC;
  --hover-color: #FF007F;
}

.satisfying-sky {
  --background-color: #B3E5FC;
  --taskbar-color: #0288D1;
  --background-color-window: #E1F5FE;
  --background-color-input: #B3E5FC;
  --font-color: #212121;
  --hover-color: #81D4FA;
}

.modern-elegance {
  --background-color: #1A1A1A;
  --taskbar-color: #262626;
  --background-color-window: #2C2C2C;
  --background-color-input: #333333;
  --font-color: #E0E0E0;
  --hover-color: #3B82F6;
}

.blue-sea-remastered {
  --background-color: #0d45ce;
  --taskbar-color: #0d45ce;
  --background-color-window: #2a5cd9;
  --background-color-input: #0d45ce;
  --font-color: #F1F1F1;
  --hover-color: #60A5FA;
}

.elegant-black-white {
  --background-color: #000000; /* Diep zwart als achtergrondkleur */
  --taskbar-color: #111111; /* Iets lichter zwart voor de footer */
  --background-color-window: #1A1A1A; /* Donkergrijs voor vensters */
  --background-color-input: #262626; /* Subtiele grijstint voor invoervelden */
  --font-color: #B0C4DE; /* Helder wit voor tekst */
  --hover-color: #2E3B4E; /* Zacht wit voor hover-effecten */
  --border-color: #333333; /* Dunne grijze borders voor scheidingselementen */
  --highlight-color: #E6E6E6; /* Lichtgrijs voor actieve elementen */
}


</style>
