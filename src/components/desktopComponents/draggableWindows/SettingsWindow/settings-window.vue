<template>
  <div class="window-content">
    <div class="header-title">Settings</div>
    <div class="settings">
      <div class="background-preference">
        <label for="color-preferred">prefer color:</label>
        <input v-model="backgroundPreference" type="radio" id="color-preferred" name="background-preference" value="1">

        <label for="image-preferred">prefer wallpaper:</label>
        <input v-model="backgroundPreference" type="radio" id="image-preferred" name="background-preference" value="2">
      </div>
      <div class="color-picker">
        <div class="window-title">Change background color: </div>
        <input v-model="colorPickerValue" id="colorPicker" type="color">
      </div>
      <div class="wallpaper-picker">
        <label>Choose a wallpaper</label>
        <div class="radio-buttons">
          <img src="@/../src/assets/images/desktopWallpapers/wallpaper_01.png" width="250" height="100" alt="wallpaper_01">
          <input v-model="selectedBackgroundImage" type="radio" id="wallpaper1" name="wallpaper" value="1"/>
          <img src="@/../src/assets/images/desktopWallpapers/wallpaper_02.png" width="250" height="100" alt="wallpaper_02">
          <input v-model="selectedBackgroundImage" type="radio" id="wallpaper2" name="wallpaper" value="2"/>
          <img src="@/../src/assets/images/desktopWallpapers/wallpaper_03.png" width="250" height="100" alt="wallpaper_03">
          <input v-model="selectedBackgroundImage" type="radio" id="wallpaper3" name="wallpaper" value="3"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "settings-window",

  mounted() {
    const backgroundPreference = Number(localStorage.getItem('background-preference'));
    if (backgroundPreference !== 0) {
      const radioButtons = document.querySelectorAll("input[name='background-preference']");
      radioButtons.forEach(radioButton => {
        if (backgroundPreference === Number(radioButton.value)) {
          radioButton.checked = true;
        }
      })
    }

    const backgroundColor = localStorage.getItem('background-color');
    if (backgroundColor !== null) {
      const colorPickerElement = document.querySelector('#colorPicker');
      colorPickerElement.value = backgroundColor;
    }

    const backgroundImage = Number(localStorage.getItem('background-image'));
    if (backgroundImage !== 0) {
      const radioButtons = document.querySelectorAll("input[name='wallpaper']");
      radioButtons.forEach(radioButton => {
        if (backgroundImage === Number(radioButton.value)) {
          radioButton.checked = true;
        }
      })
    }
  },

  data() {
    return {
      backgroundPreference: 0,
      colorPickerValue: '',
      selectedBackgroundImage: 0,
    }
  },

  watch: {
    colorPickerValue(newValue) {
      console.log(newValue)
      localStorage.setItem('background-color', newValue);
    },
    selectedBackgroundImage(newValue) {
      localStorage.setItem('background-image', newValue);
    },
    backgroundPreference(newValue) {
      console.log(newValue)
      localStorage.setItem('background-preference', newValue);
    }
  },

  methods: {
  }
}
</script>

<style scoped>
  input[type="radio"] {

  }
  .window-content {
    padding: 30px;
  }

  .header-title {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 70px;
  }

  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .wallpaper-picker {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  .radio-buttons {
    display: flex;
    flex-direction: row;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .background-preference {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
  }
</style>