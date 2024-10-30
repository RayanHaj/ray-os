<template>
  <div class="grid-container">
    <div class="grid">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="indexX" class="upperGridField">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="indexY" class="gridField"
             @dblclick.prevent="dragAndDropEventListenersDesktop($event.target.parentNode, 'dblclick')"
             @drag.prevent="dragAndDropEventListenersDesktop($event.target.parentNode,'drag')"
             @drop.prevent="dragAndDropEventListenersDesktop($event.target,'drop')"
             @dragover.prevent
             :style="{width: `${GRID_FIELD_WIDTH}px`, height: `${GRID_FIELD_HEIGHT}px`, maxWidth: `${GRID_FIELD_WIDTH}px`, maxHeight: `${GRID_FIELD_HEIGHT}px`}">
          <div v-if="indexY <= countApplications - 1 && indexX <= Math.floor(countApplications / this.GRID_HEIGHT)"
               class="gridField-content-wrapper"
               :style="{width: `${GRID_FIELD_WIDTH}px`, height: `${GRID_FIELD_HEIGHT}px`, maxWidth: `${GRID_FIELD_WIDTH}px`, maxHeight: `${GRID_FIELD_HEIGHT}px`}"
               draggable="true">
            <img class="applicationImage"
                 width="40"
                 height="40"
                 :src="applicationImageSrc(this.applicationNames[indexX * this.GRID_HEIGHT + indexY])"
                 alt="applicationImage"
                 draggable="false"
            />
            <div class="applicationName">
              {{ this.applicationNames[indexX * GRID_HEIGHT + indexY] }}
            </div>
          </div>
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
    this.$nextTick(() => {
      this.init();
    });
  },

  data() {
    return {
      windowHasResized: false,
      draggedApplication: null,
      draggedApplicationClone: null,
      countApplications: 0,
      GRID_WIDTH: 0,
      GRID_HEIGHT: 0,
      GRID_FIELD_WIDTH: 82,
      GRID_FIELD_HEIGHT: 82,
      linkedListApplicationNamesCurrentIndex: 0
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
      if (compareArrays(oldSize, newSize) === false) {
        this.init();
        this.$forceUpdate();
      }
    },
  },
  methods: {
    applicationImageSrc(appName) {
      try {
        return require(`@/assets/images/footerIcons/${appName}.png`);
      } catch (e) {
        return require(`@/assets/images/footerIcons/default-image.png`);
      }
    },
    init() {
        this.countApplications = this.applicationNames.length;

        new Promise((resolve) => {
          this.GRID_WIDTH = Math.floor(this.windowSize[0] / this.GRID_FIELD_WIDTH);
          this.GRID_HEIGHT = Math.floor((this.windowSize[1] / this.GRID_FIELD_HEIGHT));

          if (this.GRID_HEIGHT !== 0 && this.GRID_WIDTH !== 0) {
            resolve();
          }
        }).then(() => console.log('hi')
        ).finally(() => {
          if (deviceIsMobile()) {
            this.dragAndDropEventListenersMobile();
          } else {
            this.dragAndDropEventListenersDesktop();
          }
        })
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
            if (gridField.children.length === 0) {
              gridField.classList.add('filled');
              for (let child of Array.from(this.draggedApplicationClone.children)) {
                gridField.appendChild(child);
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

.gridField-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.gridField.filled:hover {
  background-color: rgba(190, 190, 190, 0.5);
}
</style>