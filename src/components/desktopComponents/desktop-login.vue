<template>
  <div class="container">
    <div class="profile-wrapper">
      <div class="img-wrapper">
        <img src="@/assets/images/profile-picture.png" width="220" height="220" alt="profile-picture">
      </div>
      <div class="name-wrapper">Rayan el Hajaoui</div>
    </div>
    <div v-if="chooseProfilePressed === false" class="choose-profile-wrapper">
      <button @click="chooseProfilePressed = !chooseProfilePressed" class="button">Sign in</button>
    </div>
    <div v-if="chooseProfilePressed === true" class="password-wrapper">
      <input type="text" placeholder="Password">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20" height="20" class="arrow-icon">
        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
        <path fill="#ffffff"
              d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: "login-screen",
  data() {
    return {
      chooseProfilePressed: false,
      sound: null,
    }
  },
  mounted() {
    this.updateSettings();
    this.sound = new Audio(require(`@/assets/audio/typing-sound.mp3`));
  },
  methods: {
    updateSettings() {
      const loginScreenElement = this.$el;

      const backgroundPreference = localStorage.getItem('background-preference');

      if (backgroundPreference === null) {
        localStorage.setItem('background-preference', '2');
        loginScreenElement.style.backgroundImage = `url(${require(`@/assets/images/desktopWallpapers/wallpaper_01.png`)})`;
        loginScreenElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';  // Apply a dark color overlay
        loginScreenElement.style.backgroundBlendMode = 'darken';
      }

      if (Number(backgroundPreference) === 1) {
        const backgroundColor = localStorage.getItem('background-color');
        console.log(backgroundColor)
        if (backgroundColor) {
          loginScreenElement.style.backgroundColor = `${backgroundColor}`;
          loginScreenElement.style.backgroundImage = null;
        } else {
          this.backgroundColor = '#0A162C'
          loginScreenElement.style.backgroundColor = this.backgroundColor;
          loginScreenElement.style.backgroundImage = null;
        }
      } else {
        let backgroundImage = Number(localStorage.getItem('background-image')) ? Number(localStorage.getItem('background-image')) : 1;
        if (backgroundImage !== 0) {
          loginScreenElement.style.backgroundImage = `url(${require(`@/assets/images/desktopWallpapers/wallpaper_0${backgroundImage}.png`)})`;
          loginScreenElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';  // Apply a dark color overlay
          loginScreenElement.style.backgroundBlendMode = 'darken';
        }
      }
    },
  },

  watch: {
    chooseProfilePressed() {
      const loginScreenElement = this.$el;

      this.$nextTick(() => {
        const inputField = loginScreenElement.querySelector('input');

        let timer = Math.random() * 1000;

        let counter = 0;
        let interval = null;

        const updateTimer = () => {
          timer = Math.random() * 250;
        }

        const inputFieldInterval = () => {
          counter += 1;
          clearInterval(interval);

          console.log(counter);
          if (counter === 47) {
            this.sound.pause();
            this.$router.push('/desktop-home')
            return;
          }
          console.log(this.sound)
          this.sound.play();
          inputField.value += "*";

          updateTimer();
          interval = setInterval(inputFieldInterval, timer)
        }

        inputFieldInterval();
      })
    }
  }
}
</script>

<style scoped>
* {
  color: white
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
  overflow: auto;
}

.profile-wrapper {
  display: flex;
  padding-top: 130px;
  gap: 10px;
  flex-direction: column;
  align-items: center;
}

.name-wrapper {
  font-size: 30px
}

.password-wrapper {
  margin-top: 30px;
  display: flex;
  align-items: center;
  width: 20%;
}

img {
  border-radius: 50%;
  border: white solid 2px;
}

input[type=text] {
  width: 100%;
  padding: 8px 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border: darkgrey solid 1px;
  border-bottom: deepskyblue solid 2px;
}

input[type=text]::placeholder {
  color: white;
}

.arrow-icon {
  position: absolute;
  left: 58%;
}

.button {
  margin-top: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px 50px 10px 50px;
  border-radius: 20px;
  border: white solid 4px;
}

.button:hover {
  cursor: pointer;
  background-color: black;
}
</style>