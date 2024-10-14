<template>
  <div class="footer-bar">
    <div class="footer-bar-items-left">
      <div class="app-icon" v-for="iconImageName in applicationNames" :key="iconImageName">
        <ApplicationIcon @click="emitApplicationName(iconImageName)" :icon-img-name="iconImageName"></ApplicationIcon>
      </div>
    </div>
    <div class="footer-bar-items-right">
      <div class="show-hidden-icons-wrapper footer-bar-right-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
        </svg>
      </div>
      <div class="keyboard-layout-wrapper footer-bar-right-item">
        <span>ENG</span>
        <span>US</span>
      </div>
      <div ref="quickSettingsMenuButton" class="wifi-sound-battery-wrapper footer-bar-right-item" @click="emitQuickSettingMenuClicked">
        <!--wifi-->
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 640 512">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2 .9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"/>
        </svg>
        <!--volume-->
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 640 512">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/>
        </svg>
        <!--battery-->
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 576 512">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M464 160c8.8 0 16 7.2 16 16l0 160c0 8.8-7.2 16-16 16L80 352c-8.8 0-16-7.2-16-16l0-160c0-8.8 7.2-16 16-16l384 0zM80 96C35.8 96 0 131.8 0 176L0 336c0 44.2 35.8 80 80 80l384 0c44.2 0 80-35.8 80-80l0-16c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l0-16c0-44.2-35.8-80-80-80L80 96zm368 96L96 192l0 128 352 0 0-128z"/>
        </svg>
      </div>
      <div class="date-time-notification-wrapper footer-bar-right-item">
        <div class="date-time-wrapper">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
        <svg class="notification-icon-wrapper" width="16" height="16" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path fill="#ffffff"
                d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 25.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416l400 0c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4l0-25.4c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm0 96c61.9 0 112 50.1 112 112l0 25.4c0 47.9 13.9 94.6 39.7 134.6L72.3 368C98.1 328 112 281.3 112 233.4l0-25.4c0-61.9 50.1-112 112-112zm64 352l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import ApplicationIcon from "@/components/desktopComponents/application-icon";

export default {
  name: "footer-bar",
  data() {
    return {
      date: '',
      time: '',
      quickSettingMenuIsOpen: false,
    }
  },
  mounted() {
    function addLeadingZero(number) {
      return ('0' + number).slice(-2);
    }

    setInterval(() => {
      const now = new Date();

      this.date = `${addLeadingZero((now.getMonth() + 1))}/${addLeadingZero(now.getUTCDate())}/${now.getFullYear()}`;
      this.time = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }, 1000);
  },
  props: {
    applicationNames: {
      type: Array,
      required: true
    }
  },
  components: {ApplicationIcon},
  methods: {
    emitApplicationName(applicationName) {
      this.$emit('applicationName', applicationName)
    },
    emitQuickSettingMenuClicked() {
      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
      this.$emit('quickSettingsMenuOpen', this.quickSettingMenuIsOpen)
    },
    getRefQuickSettingsMenuButton() {
      return this.$refs.quickSettingsMenuButton;
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'Segoe UI Variable';
  src: url('@/assets/fonts/Segoe-UI-Variable-Static-Text.ttf') format('truetype'); /* Use the correct path */
  font-weight: 400; /* Default weight */
  font-style: normal; /* Normal style */
}

* {
  font-family: 'Segoe UI Variable', serif;
  font-size: small;
  color: white;
  user-select: none;
}

.footer-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 45px;
  background-color: var(--footer-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bar-items-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
}

.footer-bar-items-right {
  margin-right: 8px;
  display: flex;
  flex-direction: row;
}

.footer-bar-right-item {
  padding: 4px 8px 4px 8px;
  transition: 0.3s;
  cursor: default;
}

.footer-bar-right-item:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.app-icon {
  padding: 5px 6px 0;
  transition: 0.3s;
}

.app-icon:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.date-time-notification-wrapper {
  display: flex;
  flex-direction: row;
}

.date-time-wrapper {
  display: flex;
  flex-direction: column;
  align-items: end;
}

.notification-icon-wrapper {
  align-self: center;
  margin-left: 7px;
}

.wifi-sound-battery-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 3px;
}

.keyboard-layout-wrapper {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.show-hidden-icons-wrapper {
  align-self: center;
  margin-right: 3px;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>