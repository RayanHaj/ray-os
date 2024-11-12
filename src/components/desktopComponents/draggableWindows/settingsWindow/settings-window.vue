<template>
  <div class="window-content">
    <div class="settings">
      <div ref="backgroundPreference" class="background-preference" :class="{ 'small-layout': windowSmall }">
        <div class="prefer-color-container">
          <div id="preferColor" class="preference-button preference-background">Prefer color</div>
          <div class="color-picker" :class="{ disabled: backgroundPreference === 2 }">
            <div id="mountbattenPink" class="static-color option" style="background-color: #A97882"></div>
            <div id="thistle" class="static-color option" style="background-color: #CDB4DB"></div>
            <div id="uranianBlue" class="static-color option" style="background-color: #BDE0FE"></div>
            <div id="beaver" class="static-color option" style="background-color: #AC7E6E"></div>
            <div id="tickleMePink" class="static-color option" style="background-color: #FF91B9"></div>
            <div id="oxfordBlue" class="static-color option" style="background-color: #0A162C"></div>
          </div>
        </div>
        <div class="vl"/>
        <div class="prefer-image-container">
          <div id="preferImage" class="preference-button preference-background">Prefer image</div>
          <div class="background-image-picker" :class="{ disabled: backgroundPreference === 1 }">
            <img id="bg1" class="static-background option" src="@/../src/assets/images/desktopWallpapers/wallpaper_01.png" width="250" height="100" alt="wallpaper_01">
            <img id="bg2" class="static-background option" src="@/../src/assets/images/desktopWallpapers/wallpaper_02.png" width="250" height="100" alt="wallpaper_02">
            <img id="bg3" class="static-background option" src="@/../src/assets/images/desktopWallpapers/wallpaper_03.png" width="250" height="100" alt="wallpaper_03">
          </div>
        </div>
      </div>
      <select @change="handlePickedTheme" id="theme-picker">
        <option>default</option>
        <option>blue-sea</option>
        <option>sunset-beach</option>
        <option>forest-dream</option>
        <option>cyberpunk-night</option>
        <option>satisfying-sky</option>
        <option>modern-elegance</option>
      </select>
      <div class="long"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "settings-window",

  data() {
    return {
      backgroundPreference: 0,
      colorPickerValue: '',
      selectedBackgroundImage: 0,
      windowSmall: false,
    }
  },

  mounted() {
    const backgroundPreferenceElement = this.$refs.backgroundPreference
    const resizeObserver = new ResizeObserver(entries => {
      requestAnimationFrame(() => {
        for (let entry of entries) {
          const width = entry.contentRect.width;
          this.windowSmall = width <= 1225;
        }
      });
    });
    resizeObserver.observe(backgroundPreferenceElement)

    const backgroundImage = Number(localStorage.getItem('background-image'));
    if (backgroundImage !== 0) {
      const radioButtons = document.querySelectorAll("input[name='wallpaper']");
      radioButtons.forEach(radioButton => {
        if (backgroundImage === Number(radioButton.value)) {
          radioButton.checked = true;
        }
      })
    }

    const colorOptionButtons = this.$el.querySelectorAll('.static-color');
    colorOptionButtons.forEach(button => {
      const backgroundColor = localStorage.getItem('background-color');
      if (backgroundColor === this.convertRgbToHex(button.style.backgroundColor)) {
        this.createColorSelectedHeaderElement(button);
      }
      button.addEventListener('click', () => {
        colorOptionButtons.forEach(button2 => {
          const removeValue = button2.children.item(0);
          if (removeValue) {
            removeValue.remove();
          }
        });
        this.createColorSelectedHeaderElement(button);
        this.colorPickerValue = this.convertRgbToHex(button.style.backgroundColor);
      });
    });

    const imageOptionButtons = this.$el.querySelectorAll('.static-background');
    imageOptionButtons.forEach(button => {
      const backgroundImage = localStorage.getItem('background-image');
      if (backgroundImage === button.id[2]) {
        this.selectedBackgroundImage = backgroundImage;
        button.style.border = '2px black solid';
      }
      button.addEventListener('click', () => {
        imageOptionButtons.forEach(button2 => {
          button2.style.border = '';
        });
        this.selectedBackgroundImage = button.id[2];
        button.style.border = '2px black solid';
      })
    });

    const backgroundPreference = Number(localStorage.getItem('background-preference'));
    const preferColorElement = this.$el.querySelector('#preferColor');
    const preferImageElement = this.$el.querySelector('#preferImage');
    if (backgroundPreference === 1) {
      this.backgroundPreference = 1;
      preferColorElement.style.backgroundColor = 'var(--hover-color)';
    } else {
      this.backgroundPreference = 2;
      preferImageElement.style.backgroundColor = 'var(--hover-color)';
    }
    backgroundPreference === 1 ? this.backgroundPreference = 1 : this.backgroundPreference = 2;

    const preferButtons = Array.from(this.$el.querySelectorAll('.preference-background'));
    for (let i = 0; i < preferButtons.length; i++) {
      preferButtons[i].addEventListener('click', () => {
        if (preferButtons[i].id === 'preferImage') {
          preferButtons[i].style.backgroundColor = 'var(--hover-color)';
          preferButtons.at(preferButtons.indexOf(preferColorElement)).style.backgroundColor = 'var(--background-color-input)';
          this.backgroundPreference = 2;
        } else {
          preferButtons[i].style.backgroundColor = 'var(--hover-color)';
          preferButtons.at(preferButtons.indexOf(preferImageElement)).style.backgroundColor = 'var(--background-color-input)';
          this.backgroundPreference = 1;
        }
      })
    }
  },

  watch: {
    colorPickerValue(newValue) {
      localStorage.setItem('background-color', newValue);
    },
    selectedBackgroundImage(newValue) {
      localStorage.setItem('background-image', newValue);
    },
    backgroundPreference(newValue) {
      localStorage.setItem('background-preference', newValue);
    }
  },

  methods: {
    handlePickedTheme(theme) {
      localStorage.setItem('theme', theme.target.value);
      this.$emit('themeChanged');
    },

    convertRgbToHex(value) {
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.strokeStyle = value;
      return ctx.strokeStyle;
    },

    createColorSelectedHeaderElement(button) {
      const element = document.createElement('div');
      element.classList.add('color-selected-header');
      element.innerText = button.id;
      element.style.textAlign = 'center';
      element.style.width = '100%';
      element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      element.style.fontSize = '12px';
      element.style.paddingTop = '10px';
      element.style.paddingBottom = '10px';
      button.appendChild(element);
    }
  }
}
</script>

<style scoped>
.long {
  background-color: red;
  width: 100px;
  height: 1000px;
}
.preference-button {
  cursor: pointer;
  background-color: var(--background-color-input);
  padding: 10px;
}
.preference-button:hover {
  background-color: var(--hover-color);
}
  .option {
    cursor: pointer;
    user-select: none;
    padding: 10px;
  }
  .option:hover {
    background-color: var(--hover-color);
  }
  .prefer-color-container, .prefer-image-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 50%;
  }
  .static-color {
    width: 100px;
    height: 100px;
  }

  .color-picker {
    display: grid;
    grid-template-rows: auto auto auto auto;
    grid-template-columns: auto auto auto auto;
    gap: 20px;
    flex-direction: column;
    justify-content: center;
  }

  .background-image-picker {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: auto auto;
    gap: 20px;
    flex-direction: column;
    justify-content: center;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .background-preference {
    display: flex;
    flex-direction: row;
    text-align: center;
    font-size: 20px;
  }

  .vl {
    border-left: 1px solid black;
    height: auto;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.5;
  }

.small-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
}

  @media screen and (max-width: 1225px) {
    .background-preference {
      flex-direction: column;
      align-items: center;
    }
  }
</style>