<template>
  <div class="grid-container">
    <div class="grid">
      <div v-for="(x, indexX) in GRID_WIDTH" :key="indexX" class="upperGridField">
        <div v-for="(y, indexY) in GRID_HEIGHT" :key="indexY" class="gridField"
             @dblclick.prevent="dragAndDropEventListenersDesktop($event.target.parentNode, 'dblclick')"
             @drag.prevent="dragAndDropEventListenersDesktop($event.target.parentNode,'drag')"
             @dragover.prevent
             @drop.prevent="dragAndDropEventListenersDesktop($event.target,'drop')"
             :style="{width: `${GRID_FIELD_WIDTH}px`, height: `${GRID_FIELD_HEIGHT}px`}">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {deviceIsMobile, compareArrays} from "@/utils/util";

export default {
  name: "desktop-grid",

  mounted() {
    this.init();
  },

  data() {
    return {
      windowHasResized: false,
      draggedApplication: null,
      draggedApplicationClone: null,
      GRID_WIDTH: 31,
      GRID_HEIGHT: 15,
      GRID_FIELD_WIDTH: 82,
      GRID_FIELD_HEIGHT: 82,
      applicationNamesCurrentIndex: -1
    }
  },

  props: {
    windowSize: {
      type: Array,
      required: false
    },
    applicationNames: {
      type: Array,
      required: false
    },
  },

  watch: {
    windowSize(newSize, oldSize) {
      console.log(compareArrays(oldSize, newSize))

      if (compareArrays(oldSize, newSize) === false) {
        if (this.windowHasResized) {
          const gridFields = this.$el.querySelectorAll('.gridField');
          gridFields.forEach(gridField => {
            while (gridField.firstChild !== null) {
              gridField.removeChild(gridField.firstChild);
            }
          })

          this.init();
        } else {
          this.windowHasResized = true;
        }
      }
    },
  },

  methods: {
    init() {
      this.GRID_WIDTH = Math.floor(this.$el.offsetWidth / this.GRID_FIELD_WIDTH);
      this.GRID_HEIGHT = Math.floor((this.$el.offsetHeight / this.GRID_FIELD_HEIGHT));

      this.addApplicationsToDesktop();

      if (deviceIsMobile()) {
        this.dragAndDropEventListenersMobile();
      } else {
        this.dragAndDropEventListenersDesktop();
      }
    },
    dragAndDropEventListenersMobile() {
      let gridFields = this.$el.querySelectorAll('.gridField');
      let draggedApplicationClone = null;
      let draggedApplication = null
      let startGridField = null;

      gridFields.forEach(gridField => {
        gridField.addEventListener("dblclick", (e) => {
          e.preventDefault();
          if (gridField.innerHTML === '') {
            return;
          }
          this.$emit('applicationName', gridField.children.namedItem('applicationName').innerText);
        });
        gridField.addEventListener("touchstart", (e) => {
          e.preventDefault();
          gridField.classList.remove('filled');
          draggedApplication = gridField;
          draggedApplicationClone = gridField.cloneNode(true);
          gridField.style.display = 'none';
          startGridField = gridField;
          this.$el.appendChild(draggedApplicationClone);
          draggedApplicationClone.className = 'application_clone';
        });

        gridField.addEventListener("touchmove", (e) => {
          e.preventDefault();

          const windowSizes = this.$el.getBoundingClientRect();

          const draggedApplicationCloneElement = this.$el.querySelector('.application_clone');
          const touch = e.changedTouches[0];
          const x = touch.clientX;
          const y = touch.clientY;
          const xPos = windowSizes.width - (windowSizes.width - x);
          const yPos = windowSizes.height - (windowSizes.height - y);
          draggedApplicationCloneElement.style.position = 'absolute';
          draggedApplicationCloneElement.style.left = `${xPos}px`;
          draggedApplicationCloneElement.style.top = `${yPos}px`;
        });

        gridField.addEventListener("touchend", (e) => {
          e.preventDefault();
          this.$el.querySelector('.application_clone').remove();
          startGridField.innerHTML = "";
          const childrenArray = Array.from(draggedApplicationClone.children);

          const touch = e.changedTouches[0];
          const x = touch.clientX;
          const y = touch.clientY;

          const newGridField = document.elementFromPoint(x, y)
          if (newGridField.children.length === 0) {
            newGridField.classList.add('filled');
            for (let child of childrenArray) {
              newGridField.appendChild(child);
            }
          } else {
            draggedApplication.classList.add('filled');
            for (let child of childrenArray) {
              draggedApplication.appendChild(child);
            }
          }
        });
      });
    },
    dragAndDropEventListenersDesktop(element, eventName) {
      const gridField = element;
      switch (eventName) {
        case 'dblclick': {
          if (gridField.innerHTML === '') {
            return;
          }
          this.$emit('applicationName', gridField.querySelector('.applicationName').innerText)
          break;
        }
        case 'drag': {
          gridField.classList.remove('filled');
          this.draggedApplication = gridField;
          this.draggedApplicationClone = gridField.cloneNode(true);
          gridField.innerHTML = "";
          break;
        }
        case 'drop': {
          if (this.draggedApplicationClone !== null) {
            const childrenArray = Array.from(this.draggedApplicationClone.children);

            if (gridField.children.length === 0) {
              gridField.classList.add('filled');
              for (let child of Array.from(this.draggedApplicationClone.children)) {
                gridField.appendChild(child);
              }
            } else {
              this.draggedApplication.classList.add('filled');
              for (let child of childrenArray) {
                this.draggedApplication.appendChild(child);
              }
            }
          }
          break;
        }
      }
    },
    getGridFieldByPosition(yPos, xPos) {
      let upperGridField = this.$el.querySelectorAll('.upperGridField');
      for (let x = 0; x < upperGridField.length; x++) {
        if (x === xPos) {
          let gridFields = upperGridField[x].querySelectorAll('.gridField');
          for (let y = 0; y < gridFields.length; y++) {
            if (y === yPos) {
              return gridFields[y]
            }
          }
        }
      }
    },

    addApplicationsToDesktop() {
      let xPos = 0;
      let yPos = 0;
      for (let name of this.applicationNames) {
        let gridField = null;

        if (yPos !== this.GRID_HEIGHT) {
          gridField = this.getGridFieldByPosition(yPos, xPos);
          yPos++
        } else {
          yPos = 0;
          xPos++;
          gridField = this.getGridFieldByPosition(yPos, xPos)
        }

        if (gridField !== undefined) {
          this.checkIfImageExists(name).then(value => {
            let img = document.createElement('img');
            let applicationNameElement = document.createElement('div');

            img.src = value === true ? require(`@/assets/images/footerIcons/${name}.png`) : require('@/assets/images/footerIcons/default-image.png');
            img.className = 'applicationImage';
            img.width = 40;
            img.height = 40;

            applicationNameElement.innerText = name;
            applicationNameElement.style.fontSize = '9px';
            applicationNameElement.style.color = 'white';
            applicationNameElement.className = 'applicationName';
            gridField.classList.add('filled');

            gridField.appendChild(img);
            gridField.appendChild(applicationNameElement);
          });
        }
      }
    },

    checkIfImageExists(name) {
      return new Promise((resolve) => {
        const img = new Image();
        try {
          img.src = require(`@/assets/images/footerIcons/${name}.png`);

          img.onload = () => {
            resolve(true);
          };

          img.onerror = () => {
            resolve(false);
          };
        } catch (err) {
          resolve(false);
        }
      });
    }
  }
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: auto;
  grid-template-rows: auto;
  align-items: center;
  justify-items: center;
}

.grid {
  display: flex;
  flex-direction: row;
  position: relative;
}

.gridField {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  gap: 2px;
  color: white;
  user-select: none;
}

.gridField.filled:hover {
  background-color: rgba(190, 190, 190, 0.5);
}
</style>