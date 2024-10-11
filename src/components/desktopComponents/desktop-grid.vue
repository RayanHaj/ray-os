<template>
  <div class="grid-container">
    <div class="grid">
    </div>
  </div>
</template>

<script>
export default {
  name: "desktop-grid",

  mounted() {
    this.init();
  },

  data() {
    return {
      gridSizes: {
        //[width and height of grid item, count width grid items, count height grid items]
        'small': [14, 50, 50],
        'normal': [20, 35, 35],
        'larger': [28, 20, 20],
        'large': [35, 56, 27]
      },
      openWindows: [],
      GRID_WIDTH: 31,
      GRID_HEIGHT: 15
    }
  },

  props: {
    gridSize: {
      type: String,
      required: true
    },
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
    applicationName(newName, oldName) {
      console.log(newName, oldName)
      if (newName !== '' && !this.openWindows.includes(newName)) {
        // this.openWindow(newName);
        this.openWindows.push(newName);
      }
    },

    windowSize() {
      const gridContainerChildElement = this.$el.children.item(0);
      while (gridContainerChildElement.firstChild) {
        gridContainerChildElement.removeChild(gridContainerChildElement.firstChild);
      }

      this.init();
    },

    // IMPLEMENT THIS FUNCTION
    // applicationNames(newNames, oldNames) {
    //
    // }
  },

  methods: {
    init() {
      const GRID_ELEMENT_WIDTH = 82;
      const GRID_ELEMENT_HEIGHT = 82;

      console.log(`width: ${this.$el.offsetWidth}`)
      this.GRID_WIDTH = Math.floor(this.$el.offsetWidth / GRID_ELEMENT_WIDTH);

      this.$nextTick(()=>{

        //FIX THIS VARIABLE ASSIGNMENT
        this.GRID_HEIGHT = Math.floor((this.$el.offsetHeight / GRID_ELEMENT_HEIGHT));
      })

      this.createGrid();
      this.addApplicationsToDesktop();

      let gridFields = document.querySelectorAll('.gridField');
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
          console.log(draggedApplication)
          draggedApplicationClone = gridField.cloneNode(true);
          gridField.innerHTML = "";
        });
        gridField.addEventListener("dragover", (e) => {
          e.preventDefault();
          console.log("Dragging over")
        });
        gridField.addEventListener("dragleave", () => {

        });
        gridField.addEventListener("drop", () => {
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

      })
    },
    createGrid() {
      let grid = document.querySelector('.grid');

      console.log(`grid height: ${this.GRID_HEIGHT}`);
      console.log(`grid width: ${this.GRID_WIDTH}`);
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        let upperGridField = document.createElement('div');
        upperGridField.id = 'upperGridField';
        upperGridField.className = 'upperGridField';

        for (let y = 0; y < this.GRID_HEIGHT; y++) {
          let gridField = document.createElement('div');
          gridField.id = 'gridField';
          gridField.className = 'gridField';

          upperGridField.appendChild(gridField);
          grid.appendChild(upperGridField);
        }
      }
    },
    getGridFieldByPosition(yPos, xPos) {
      let upperGridField = document.getElementsByClassName('upperGridField');
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

    // AddElementInGridPosition(yPos, xPos, application) {
    //   let gridField = this.getGridFieldByPosition(yPos, xPos);
    //
    // },

    DeleteElementInGridPosition(yPos, xPos) {
      let gridField = this.getGridFieldByPosition(yPos, xPos);
      gridField.innerHTML = "";
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

        console.log(name)

        this.checkIfImageExists(name).then(value => {
          let checkBoxElement = document.createElement('input');
          checkBoxElement.type = 'checkbox';
          checkBoxElement.className = 'checkbox';
          gridField.appendChild(checkBoxElement);
          if (value) {
            let img = document.createElement('img');

            img.src = require(`@/assets/images/footerIcons/${name}.png`);
            img.width = 40;
            img.height = 40;

            gridField.appendChild(img);
          }
        }).finally(() => {
          let applicationNameElement = document.createElement('div');
          applicationNameElement.innerText = name;
          applicationNameElement.style.fontSize = '9px';
          applicationNameElement.style.color = 'white';
          applicationNameElement.id = 'applicationName';
          gridField.classList.add('filled');
          gridField.appendChild(applicationNameElement);
        });
      }
    },

    checkIfImageExists(name) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = require(`@/assets/images/footerIcons/${name}.png`);

        img.onload = () => {
          resolve(true); // Resolve the promise as true if the image loads successfully
        };

        img.onerror = () => {
          resolve(false); // Resolve the promise as false if there’s an error
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

.upperGridField {
  display: flex;
  flex-direction: column;
}

.gridField {
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 82px;
  height: 82px;
  font-size: 10px;
  gap: 2px;
  color: white;
  user-select: none;
}

.gridField.filled:hover {
  background-color: rgba(190, 190, 190, 0.5);
}

.gridField.filled:hover .checkbox {
  display: block;
}

.checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  display: none;
}
</style>