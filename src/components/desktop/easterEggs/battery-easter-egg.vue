<template>
  <div class="container">
    <div class="wrapper">
      <div class="battery"></div>
      <div class="battery-head"></div>
    </div>
    <div class="percentage">{{ percentage }}%</div>
  </div>
</template>

<script>
export default {
  name: "battery-easter-egg",
  data() {
    return {
      percentage: 100,
      lightSwitchSound: null,
      lightSwitchSoundPlayed: false,
      alarmSound: null,
      alarmSoundPlayed: false,
      typingSound: null
    }
  },
  async mounted() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileOrTablet = /mobile|android|tablet|ipad|iphone/.test(userAgent);

    if (isMobileOrTablet === true) {
      this.$router.push('/');
    }

    await this.createBattery();

    this.typingSound = new Audio(require(`@/assets/audio/typing-sound.mp3`));

    this.lightSwitchSound = new Audio(require(`@/assets/audio/light-switch-sound.mp3`));
    this.alarmSound = new Audio(require(`@/assets/audio/alarm-sound.mp3`));

    const batteryRows = this.$el.querySelectorAll('.battery-row');

    let timer = Math.random() * 1000;

    let counter = 0;
    let interval = null;

    const updateTimer = () => {
      timer = Math.random() * 250;
    }

    const inputFieldInterval = async () => {
      clearInterval(interval);

      if (counter === 99) {
        this.percentage = 100 - counter;
        await this.playSound(2);
        setTimeout(() => {
          this.alarmSound.pause();
          this.playSound(1).then(async () => {
            await this.batteryDrained();
          });
        }, 5000)
        return;
      }

      const batteryRowStyle = batteryRows[batteryRows.length - 1 - counter].style;
      batteryRowStyle.backgroundColor = 'transparent'
      this.percentage = (100 - counter);

      counter += 1;
      updateTimer();
      interval = setInterval(inputFieldInterval, timer)
    }

    await inputFieldInterval();
  },
  methods: {
    async createBattery() {
      return new Promise((resolve) => {
        const batteryElement = this.$el.querySelector('.battery');
        for (let i = 0; i < 100; i++) {
          const element = document.createElement('div');
          element.className = 'battery-row'
          element.style.width = '10px';
          element.style.backgroundColor = 'green';
          batteryElement.appendChild(element);
        }
        resolve();
      })
    },

    async batteryDrained() {
      this.$el.innerHTML = '';
      this.$el.style.backgroundColor = 'black';

      const textElement = document.createElement('p');
      textElement.style.fontSize = '30px';
      textElement.style.fontWeight = 'bolder';
      textElement.style.color = 'white';
      this.$el.appendChild(textElement);

      await this.setIntervalTextOutput('Well done... you drained the battery. How will you hire me now?', textElement);
      await this.setIntervalTextOutput('Just messing with you, head back and enjoy your desktop candy. You deserve it.', textElement);
      this.$router.push('/desktop-home')
    },

    async setIntervalTextOutput(string, textElement) {
      let counter = 0;

      return new Promise((resolve) => {
        setTimeout(() => {
          textElement.innerHTML = '';
          const interval = setInterval(() => {
            if (counter < string.length) {
              this.typingSound.play();
              if (string[counter] === ' ') {
                textElement.innerHTML += '&nbsp;';
              } else {
                textElement.innerText += string[counter];
              }
              counter++;
            } else {
              this.typingSound.pause();
              clearInterval(interval);
              resolve();
            }
          }, 100)
        }, 4000)
      })
    },

    async playSound(sound) {
      switch (sound) {
        case 1:
          await this.lightSwitchSound.play();
          break;
        case 2:
          await this.alarmSound.play();
          break;
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  height: 100%;
  width: 100%;
  gap: 20px;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.battery-head {
  width: 30px;
  height: 70px;
  border-bottom-right-radius: 5px;
  border-top-right-radius: 5px;
  background-color: black;
}

.wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.battery {
  display: flex;
  flex-direction: row;
  height: 100px;
  border: black solid 2px;
  width: 200px;
}

.percentage {
  font-size: 40px;
  font-weight: bolder;
}
</style>