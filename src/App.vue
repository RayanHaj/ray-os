<template>
  <div :class="theme">
    <RouterView/>
  </div>
</template>:

<script>

import { mapStores } from "pinia";
import {usePreferencesStore} from "@/stores/globalState";

export default {
  name: 'App',
  data() {
    return {
      theme: ''
    }
  },
  beforeMount() {
    this.theme = this.preferencesStore.getTheme();
  },
  computed: {
    ...mapStores(usePreferencesStore)
  },
  watch: {
    'preferencesStore.theme'() {
      if (this.preferencesStore.theme !== '') {
        this.theme = this.preferencesStore.theme;
      }
    },
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

h1, h2, h3, h4, h5, h6 {
  font-family: "Inter", sans-serif;
  color: #e0e0e0;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }

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

.terminal-dark {
  --background-color: #000000; /* Pure black for the terminal background */
  --taskbar-color: #1A1A1A; /* Dark gray for the taskbar */
  --background-color-window: #121212; /* Slightly lighter black for windows */
  --background-color-input: #000000; /* Consistent with terminal background */
  --font-color: #00FF00; /* Bright green for terminal text */
  --hover-color: #003300; /* Dark green for hover effects */
  --border-input-color: #004400; /* Subtle green for input borders */
  --border-input-selected-color: #00FF00; /* Same bright green for selected input */
  --border-window-color: #00FF00; /* Matches font color for consistency */
}

.synthwave-neon {
  --background-color: #1A0023; /* Diep paars als een nachtelijke basis */
  --taskbar-color: #2C003E; /* Donker neonpaars voor de taskbar */
  --background-color-window: #FF0080; /* Fel neonroze voor ramen */
  --background-color-input: #7600FF; /* Neonpaars voor invoervelden */
  --font-color: #00FFFF; /* Neonblauw voor tekst */
  --hover-color: #FF4500; /* Neonoranje voor hover-effecten */
  --border-input-color: #FF00FF; /* Felroze als rand voor inputvelden */
  --border-input-selected-color: #00FF80; /* Neon-groen voor geselecteerde invoer */
  --border-window-color: #FF0080; /* Neonroze als rand voor ramen */
}

.cosmic-glow {
  --background-color: #0D0221; /* Diep donkerblauw, zoals de kosmos */
  --taskbar-color: #1A0535; /* Iets lichter paarsblauw voor een galactische uitstraling */
  --background-color-window: #3D087B; /* Intens paars voor een nevelachtige sfeer */
  --background-color-input: #251351; /* Donkerpaars voor invoervelden */
  --font-color: #FFFFFF; /* Helder wit, zoals sterrenlicht */
  --hover-color: #FF66FF; /* Neonroze, als de glans van een verre ster */
  --border-input-color: #4B0082; /* Indigo voor een subtiele kosmische rand */
  --border-input-selected-color: #FFD700; /* Goud, als een stralende ster */
  --border-window-color: #00FFFF; /* Neonblauw, geïnspireerd door verre planeten */
  --highlight-color: #9400D3; /* Diep violet als accentkleur voor knoppen of highlights */
}

.fantasy-theme {
  --background-color: #1A2B44; /* Deep, dark blue like a midnight sky */
  --taskbar-color: #4A5B7E; /* Soft grayish-blue, like twilight */
  --background-color-window: #3B4A5E; /* Muted slate blue for window backgrounds */
  --background-color-input: #7D8A9C; /* Misty gray-blue for input fields */
  --font-color: #F4E1A1; /* Soft golden yellow, like light from a lantern */
  --hover-color: #9FAE99; /* Soft green glow, like a mystical aura */
  --border-input-color: #A7B0C0; /* Light silver-gray for input borders */
  --border-input-selected-color: #FFD700; /* Bright gold for selected input fields */
  --border-window-color: #C1C9D4; /* Light silver for window borders */
  --highlight-color: #9ACB88; /* Enchanted green for highlighted elements */
}
.midnight-theme {
  --background-color: #1B2631; /* Deep, dark midnight blue for the background */
  --taskbar-color: #0A0F12; /* Darker blackish shade for the taskbar */
  --background-color-window: #2D3B48; /* Muted charcoal blue for window backgrounds */
  --background-color-input: #4A5860; /* Dark slate gray for input fields */
  --font-color: #E1E8F0; /* Soft pale blue for text, like moonlight */
  --hover-color: #3C4F5C; /* Darkened teal blue for hover effects */
  --border-input-color: #4F6771; /* Faded greenish-gray for input borders */
  --border-input-selected-color: #A8C9E8; /* Light blue glow when focused */
  --border-window-color: #3E4D58; /* Subtle grayish-blue for window borders */
  --highlight-color: #FFB6C1; /* Soft pinkish hue, like distant stars */
}
</style>
