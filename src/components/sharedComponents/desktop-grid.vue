<template>
  <div class="grid-container">
    <div class="grid">
    </div>
  </div>
</template>

<script>
import {deviceIsMobile} from "@/utils/util";
export default {
  name: "desktop-grid",

  mounted() {
    this.init();
  },

  data() {
    return {
      GRID_WIDTH: 31,
      GRID_HEIGHT: 15,
      GRID_FIELD_WIDTH: 82,
      GRID_FIELD_HEIGHT: 82
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
    windowSize() {
      const gridContainerChildElement = this.$el.children.item(0);
      while (gridContainerChildElement.firstChild) {
        gridContainerChildElement.removeChild(gridContainerChildElement.firstChild);
      }

      this.init();
    },
  },

  methods: {
    init() {
      this.GRID_WIDTH = Math.floor(this.$el.offsetWidth / this.GRID_FIELD_WIDTH);

      this.$nextTick(() => {
        //FIX THIS VARIABLE ASSIGNMENT
        this.GRID_HEIGHT = Math.floor((this.$el.offsetHeight / this.GRID_FIELD_HEIGHT));
      })

      this.createGrid();
      this.addApplicationsToDesktop();

      if (deviceIsMobile()) {
        this.dragAndDropEventListenersMobile();
      } else {
        this.dragAndDropEventListenersDesktop();
      }
    },
    createGrid() {
      let grid = this.$el.querySelector('.grid');

      for (let x = 0; x < this.GRID_WIDTH; x++) {
        let upperGridField = document.createElement('div');
        upperGridField.className = 'upperGridField';

        for (let y = 0; y < this.GRID_HEIGHT; y++) {
          let gridField = document.createElement('div');
          gridField.className = 'gridField';
          gridField.style.width = `${this.GRID_FIELD_WIDTH}px`;
          gridField.style.height = `${this.GRID_FIELD_HEIGHT}px`;

          upperGridField.appendChild(gridField);
          grid.appendChild(upperGridField);
        }
      }
    },
    dragAndDropEventListenersMobile() {
      let gridFields = this.$el.querySelectorAll('.gridField');
      // eslint-disable-next-line no-unused-vars
      let draggedApplicationClone = null;
      // eslint-disable-next-line no-unused-vars
      let draggedApplication = null
      let startGridField = null;

      gridFields.forEach(gridField => {
        console.log(gridField)
        gridField.addEventListener("dblclick", (e) => {
          e.preventDefault();
          if (gridField.innerHTML === '') {
            return;
          }
          this.$emit('applicationName', gridField.children.namedItem('applicationName').innerText)
        });
        gridField.addEventListener("touchstart", (e) => {
          e.preventDefault();
          gridField.classList.remove('filled');
          draggedApplication = gridField;
          draggedApplicationClone = gridField.cloneNode(true);
          gridField.style.display = 'none';
          startGridField = gridField;
        });

        // The dragover event allows elements to accept drops by preventing the default behavior.
        gridField.addEventListener("touchmove", (e) => {
          e.preventDefault();
          console.log('move')
        });

        gridField.addEventListener("touchend", (e) => {
          e.preventDefault();
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
    dragAndDropEventListenersDesktop() {
      let gridFields = this.$el.querySelectorAll('.gridField');
      let draggedApplicationClone = null;
      let draggedApplication = null

      gridFields.forEach(gridField => {
        gridField.addEventListener("dblclick", (e) => {
          e.preventDefault();
          if (gridField.innerHTML === '') {
            return;
          }
          this.$emit('applicationName', gridField.children.namedItem('applicationName').innerText)
        });
        gridField.addEventListener("drag", (e) => {
          e.preventDefault();
          gridField.classList.remove('filled');
          draggedApplication = gridField;
          draggedApplicationClone = gridField.cloneNode(true);
          gridField.innerHTML = "";
        });

        // The dragover event allows elements to accept drops by preventing the default behavior.
        gridField.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        gridField.addEventListener("drop", (e) => {
          e.preventDefault();
          const childrenArray = Array.from(draggedApplicationClone.children);
          if (gridField.children.length === 0) {
            gridField.classList.add('filled');
            for (let child of childrenArray) {
              gridField.appendChild(child);
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
    getGridFieldByPosition(yPos, xPos) {
      let upperGridField = this.$el.getElementsByClassName('upperGridField');
      for (let x = 0; x < upperGridField.length; x++) {
        if (x === xPos) {
          let gridFields = upperGridField[x].getElementsByClassName('gridField');
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

        this.checkIfImageExists(name).then(value => {
          if (value) {
            let img = document.createElement('img');
            let applicationNameElement = document.createElement('div');

            img.src = require(`@/assets/images/footerIcons/${name}.png`);
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
          }
        });
      }
    },

    checkIfImageExists(name) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = require(`@/assets/images/footerIcons/${name}.png`);

        img.onload = () => {
          resolve(true);
        };

        img.onerror = () => {
          resolve(false);
        };
      });
    }
  }
}
</script>

<style>
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