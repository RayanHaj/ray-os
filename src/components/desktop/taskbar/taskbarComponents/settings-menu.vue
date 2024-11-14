<template>
  <div class="container">
    <div class="toggle-buttons">
      <div class="wifi-toggle-wrapper">
        <div class="internet-toggle toggle-button btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 640 512">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2 .9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 320 512">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
          </svg>
        </div>
        <div class="toggle-text">Wi-Fi</div>
      </div>
      <div class="bluetooth-toggle-wrapper">
        <div class="bluetooth-toggle toggle-button btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 320 512">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M196.5 260l92.6-103.3L143.1 0v206.3l-86.1-86.1-31.4 31.4 108.1 108.4L25.6 368.4l31.4 31.4 86.1-86.1L145.8 512l148.6-148.6-97.9-103.3zm40.9-103l-50 50-.3-100.3 50.3 50.3zM187.4 313l50 50-50.3 50.3 .3-100.3z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 320 512">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
          </svg>
        </div>
        <div class="toggle-text">Bluetooth</div>
      </div>

      <div class="airplane-toggle-wrapper">
        <div class="airplane-toggle toggle-button btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 576 512">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z"/>
          </svg>
        </div>
        <div class="toggle-text">Airplane mode</div>
      </div>
    </div>
    <div class="brightness-control">
      <!--sun icon-->
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512">
        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
        <path fill="#ffffff"
              d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>
      </svg>
      <input v-model="brightnessInputValue" class="brightness-input" type="range" min="20" max="100" value="100">
    </div>
    <div class="taskbar">
      <div class="battery" @click="batteryEasterEggs">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 576 512" class="footer-item btn">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M464 160c8.8 0 16 7.2 16 16l0 160c0 8.8-7.2 16-16 16L80 352c-8.8 0-16-7.2-16-16l0-160c0-8.8 7.2-16 16-16l384 0zM80 96C35.8 96 0 131.8 0 176L0 336c0 44.2 35.8 80 80 80l384 0c44.2 0 80-35.8 80-80l0-16c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l0-16c0-44.2-35.8-80-80-80L80 96zm368 96L96 192l0 128 352 0 0-128z"/>
        </svg>
      </div>
      <div class="edit-plus-settings">
        <!-- edit toggle buttons layout -->
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" class="footer-item btn">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
        </svg>
        <!-- settings icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" class="footer-item btn">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "settings-menu",
  data() {
    return {
      brightnessInputValue: 100,
    }
  },
  mounted() {
    const value = localStorage.getItem('brightnessValue');
    if (value !== null) {
      this.$el.querySelector('.brightness-input').value = value;
    }
  },
  methods: {
    async closeSettingsMenuAnimation() {
      return new Promise((resolve) => {
        this.$el.classList.add('add-closing-animation');

        this.$el.addEventListener('animationend', () => {
          this.$el.classList.remove('add-closing-animation');
          resolve();
        }, { once: true });
      });
    },
    batteryEasterEggs() {
      this.$router.push('/battery-drain');
    }
  },
  watch: {
    brightnessInputValue(newValue) {
      localStorage.setItem('brightnessValue', newValue);
      this.$emit('brightnessValueChanged');
    }
  }
}
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  background-color: var(--background-color-window);
  border-radius: 10px;
  animation: 0.2s openingAnimation;
  z-index: 2;
}

.add-closing-animation {
  animation: 0.2s closingAnimation;
}

.toggle-buttons, .brightness-control {
  padding: 20px;
}

.toggle-buttons {
  display: grid;
  justify-items: center;
  grid-template-columns: repeat(3, 1fr);
}

.taskbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}

.edit-plus-settings {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.brightness-control {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  justify-content: center;
}

.brightness-input {
  -webkit-appearance: none;
  height: 8px;
  border-radius: 5px;
  background-color: var(--background-color-input);
  outline: none;
  width: 100%;
}

.brightness-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--taskbar-color);
  border-radius: 50%;
  cursor: pointer;
}

.toggle-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;
  padding-right: 15px;
  width: 55px;
  height: 50px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.4);
}

.airplane-toggle {
  display: flex;
  justify-content: center;
}

.footer-item {
  padding: 3px;
}

.footer-item:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.toggle-text {
  margin: 0;
  text-align: center;
  padding-top: 10px;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

@keyframes openingAnimation {
  from {
    bottom: -250px;
  }
  to {
    bottom: 60px;
  }
}

@keyframes closingAnimation {
  from {
    bottom: 60px;
  }
  to {
    bottom: -250px;
  }
}
</style>