<template>
  <div :class="theme">
    <RouterView/>
  </div>
</template>

<script>

import { useGlobalState } from "@/stores/globalState";

export default {
  name: 'App',
  mounted() {
    this.setOrUpdateTheme();
  },
  data() {
    return {
      theme: 'default',
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  watch: {
    'globalState.theme'() {
      this.setOrUpdateTheme();
    }
  },
  methods: {
    setOrUpdateTheme() {
      const theme = this.globalState.getTheme();
      if (theme !== '') {
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
  --border-input-color: #444444;
  --border-input-selected-color: #00FFFF;
  --border-window-color: #FFFFFFFF; /* Same as font color */
}

.blue-sea {
  --background-color: #04ADBF;
  --taskbar-color: #024959;
  --background-color-window: #0D1440;
  --background-color-input: #04ADBF;
  --font-color: #FFFFFFFF;
  --hover-color: #006370;
  --border-input-color: #037A8A;
  --border-input-selected-color: #00FFFF;
  --border-window-color: #FFFFFFFF; /* Same as font color */
}

.sunset-beach {
  --background-color: #FF6F61;
  --taskbar-color: #C74330;
  --background-color-window: #FFD9C2;
  --background-color-input: #FF826F;
  --font-color: #FFF3E0; /* Soft peachy-white for a more fun vibe */
  --hover-color: #D85A47;
  --border-input-color: #A52A2A; /* Deep brownish red for clear distinction */
  --border-input-selected-color: #FFD700; /* Bright gold for high contrast and visibility */
  --border-window-color: #FFF3E0; /* Same as font color */
}

.forest-dream {
  --background-color: #2E5B2A;
  --taskbar-color: #1C3F1A;
  --background-color-window: #A3CBA0;
  --background-color-input: #2E5B2A;
  --font-color: #FFFFFF;
  --hover-color: #4F7A4C;
  --border-input-color: #1F3D1A;
  --border-input-selected-color: #77DD77;
  --border-window-color: #FFFFFF; /* Same as font color */
}

.cyberpunk-night {
  --background-color: #1E1E2F;
  --taskbar-color: #0F0F1A;
  --background-color-window: #3D3D6B;
  --background-color-input: #2B2B4D;
  --font-color: #00FFCC;
  --hover-color: #FF007F;
  --border-input-color: #2C2C44;
  --border-input-selected-color: #FF66CC;
  --border-window-color: #00FFCC; /* Same as font color */
}

.satisfying-sky {
  --background-color: #B3E5FC;
  --taskbar-color: #0288D1;
  --background-color-window: #E1F5FE;
  --background-color-input: #B3E5FC;
  --font-color: #212121; /* Keeps text readable */
  --hover-color: #81D4FA;
  --border-input-color: #007BB8; /* Darker blue for clear distinction */
  --border-input-selected-color: #FFD700; /* Bright gold for maximum contrast */
  --border-window-color: #212121; /* Same as font color */
}

.modern-elegance {
  --background-color: #1A1A1A;
  --taskbar-color: #262626;
  --background-color-window: #2C2C2C;
  --background-color-input: #333333;
  --font-color: #E0E0E0;
  --hover-color: #3B82F6;
  --border-input-color: #3A3A3A;
  --border-input-selected-color: #FFFFFF;
  --border-window-color: #E0E0E0; /* Same as font color */
}

.blue-sea-remastered {
  --background-color: #0d45ce;
  --taskbar-color: #0d45ce;
  --background-color-window: #2a5cd9;
  --background-color-input: #0d45ce;
  --font-color: #F1F1F1;
  --hover-color: #60A5FA;
  --border-input-color: #1747B5;
  --border-input-selected-color: #00C6FF;
  --border-window-color: #F1F1F1; /* Same as font color */
}

.elegant-black-white {
  --background-color: #000000;
  --taskbar-color: #111111;
  --background-color-window: #1A1A1A;
  --background-color-input: #262626;
  --font-color: #B0C4DE;
  --hover-color: #2E3B4E;
  --border-input-color: #333333;
  --border-input-selected-color: #E6E6E6;
  --border-window-color: #B0C4DE; /* Same as font color */
}

.aurora-glow {
  --background-color: #1B2A49; /* Deep navy blue */
  --taskbar-color: #102542; /* Darker shade for taskbar */
  --background-color-window: #4C768C; /* Muted teal for windows */
  --background-color-input: #2A4A64; /* Dark teal for input fields */
  --font-color: #E8F9FD; /* Light cyan for readability */
  --hover-color: #64C9CF; /* Bright teal for hover */
  --border-input-color: #3E596F; /* Subtle but clear */
  --border-input-selected-color: #A4E5E0; /* Vibrant mint for selected items */
  --border-window-color: #E8F9FD; /* Same as font color */
}

.crimson-royale {
  --background-color: #3B1F2B; /* Deep crimson */
  --taskbar-color: #2E1721; /* Darker crimson */
  --background-color-window: #5B303E; /* Muted rose for windows */
  --background-color-input: #4A1F29; /* Deep red for input fields */
  --font-color: #FFD700; /* Gold for text */
  --hover-color: #FF6347; /* Tomato red for hover */
  --border-input-color: #8B0000; /* Bold crimson for borders */
  --border-input-selected-color: #FFD700; /* Bright gold for selected items */
  --border-window-color: #FFD700; /* Same as font color */
}

</style>
