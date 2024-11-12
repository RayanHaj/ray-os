<template>
  <div class="grid-container">
    <div v-if="GRID_HEIGHT > 0"
         class="grid"
         @dragover.prevent="dragAndDropEventListenersDesktop($event, 'dragover')"
         @mousemove="mousePositions = {x: $event.clientX, y: $event.clientY}">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="indexX" class="upperGridField">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="indexY" class="gridField"
             :class="{'filled': checkShouldFillGridField(indexX, indexY) }"
             @dblclick="dragAndDropEventListenersDesktop($event, 'dblclick')"
             @drop="dragAndDropEventListenersDesktop($event, 'drop')"
             @dragstart="dragAndDropEventListenersDesktop($event, 'dragstart')"
             @click="onClickGridField($event)"
             @keydown.prevent="onKeydownGridField($event)"
             @contextmenu.prevent="onRightClickGridField"
             @mouseover="onMouseOverGridField"
             @mouseleave="onMouseLeaveGridField"
             tabindex="0"
             :style="{
              width: `${GRID_FIELD_WIDTH}px`,
              height: `${GRID_FIELD_HEIGHT}px`,
              maxWidth: `${GRID_FIELD_WIDTH}px`,
              maxHeight: `${GRID_FIELD_HEIGHT}px`
            }"
        >
          <div
              v-if="checkShouldFillGridField(indexX, indexY)"
              class="grid-field-content-wrapper"
              :style="{width: `${GRID_FIELD_WIDTH}px`, height: `${GRID_FIELD_HEIGHT}px`, maxWidth: `${GRID_FIELD_WIDTH}px`, maxHeight: `${GRID_FIELD_HEIGHT}px`}"
              draggable="true"
          >
            <div class="grid-field-img-checkbox-wrapper">
              <input type="checkbox" class="grid-field-checkbox">
              <img
                  class="applicationImage"
                  width="40"
                  height="40"
                  :src="applicationImageSrc(applicationNames[indexX * GRID_HEIGHT + indexY])"
                  alt="applicationImage"
                  draggable="false"
              />
            </div>
            <div class="applicationName">
              {{ applicationNames[indexX * GRID_HEIGHT + indexY] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="contextMenuActive === true" class="context-menu" ref="contextMenu">
      <button v-if="currentGridFieldOnRightClickContainsApplication" @click="contextMenuActions($event, 'copy')">copy
      </button>
      <button @click="contextMenuActions($event, 'paste')">paste</button>
      <button v-if="currentGridFieldOnRightClickContainsApplication" @click="contextMenuActions($event, 'delete')">
        delete
      </button>
    </div>
  </div>
</template>

<script>
import {compareArrays} from "@/utils/util";

export default {
  name: "desktop-grid",

  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },

  data() {
    return {
      contextMenuActive: false,
      draggedApplication: null,
      draggedApplicationClone: null,
      currentGridFieldOnRightClick: null,
      currentGridFieldOnRightClickContainsApplication: false,
      copiedApplication: null,
      countApplications: 0,
      GRID_WIDTH: 0,
      GRID_HEIGHT: 0,
      GRID_FIELD_WIDTH: 82,
      GRID_FIELD_HEIGHT: 82,
      listApplicationElements: [],
      selectedApplications: [],
      mousePositions: {x: 0, y: 0},
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

        let gridFields = this.getAllGridFields();
        gridFields.forEach(gridField => {
          if (gridField.children.length !== 0) {
            gridField.removeChild(gridField.children[0]);
            gridField.classList.remove('filled');
          }
        });
        this.addApplicationsToDesktop();
      }
    },
  },
  methods: {
    init() {
      let listApplicationElementsTempArray = [];

      this.getAllGridFields().forEach(gridField => {
        if (gridField.children.length !== 0) {
          const applicationElement = gridField.children[0];
          const applicationName = gridField.children[0].children[1].innerText;
          const indexOfApplicationName = this.applicationNames.indexOf(applicationName);

          let applicationElementObject = {
            'applicationElement': applicationElement,
            'indexOfApplicationName': indexOfApplicationName
          }

          listApplicationElementsTempArray.push(applicationElementObject);
        }
      });

      listApplicationElementsTempArray.forEach(object => {
        this.listApplicationElements[object.indexOfApplicationName] = object.applicationElement;
      });

      this.countApplications = this.applicationNames.length;

      if (this.windowSize[0] !== null && this.windowSize[1] !== null) {
        this.GRID_WIDTH = Math.floor(this.windowSize[0] / this.GRID_FIELD_WIDTH);
        this.GRID_HEIGHT = Math.floor((this.windowSize[1] / this.GRID_FIELD_HEIGHT));
      }
    },
    onClickGridField(event) {
      const gridField = event.currentTarget;
      const checkbox = event.currentTarget.querySelector('.grid-field-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.checked === true ? gridField.classList.add('selected') : gridField.classList.remove('selected');
      }

      this.contextMenuActive === true ? this.contextMenuActive = false : null
    },
    onKeydownGridField(event) {
      if (event.ctrlKey && event.code === 'KeyC') {
        this.selectedApplications = this.getAllSelectedGridFields();
      }
      if (event.ctrlKey && event.code === 'KeyV') {
        if (this.selectedApplications.length > 0) {
          const gridFieldAtMousePosition = this.getGridFieldByPosition(this.mousePositions.x, this.mousePositions.y);
          if (this.selectedApplications.length > 1) {
            const gridFieldsInVerticalRow = gridFieldAtMousePosition.parentNode;
            console.log(Array.of(gridFieldsInVerticalRow.querySelectorAll('.gridField')))
            // const indexOfGridFieldInVerticalRow = Array.of(gridFieldsInVerticalRow).filter(gridField => gridField !== gridFieldAtMousePosition);
            // console.log(indexOfGridFieldInVerticalRow)
          }
          this.selectedApplications.forEach(application => {
            const clone = application.children[0].cloneNode(true);
            this.addApplicationToSpecificGridField(clone, gridFieldAtMousePosition);
          });
        }
      }
    },
    getAllSelectedGridFields() {
      const gridFields = this.getAllGridFields();

      let array = [];

      gridFields.forEach(gridField => {
        const checkbox = gridField.querySelector('.grid-field-checkbox');
        if (checkbox && checkbox.checked) {
          array.push(gridField);
        }
      });

      return array;
    },
    onRightClickGridField(e) {
      const contextMenu = this.$refs.contextMenu;
      this.currentGridFieldOnRightClick = e.currentTarget;

      if (this.currentGridFieldOnRightClick.querySelector('.grid-field-content-wrapper')) {
        this.currentGridFieldOnRightClickContainsApplication = true;
      } else {
        this.currentGridFieldOnRightClickContainsApplication = false;
      }
      if (this.contextMenuActive === false) {
        this.contextMenuActive = true;
      }

      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
    },
    onMouseOverGridField(e) {
      const gridField = e.currentTarget;
      const checkbox = gridField.querySelector('.grid-field-checkbox');
      if (checkbox) {
        checkbox.style.display = 'block';
      }
    },
    onMouseLeaveGridField(e) {
      const gridField = e.currentTarget;
      const checkbox = gridField.querySelector('.grid-field-checkbox');
      if (checkbox && !gridField.classList.contains('selected')) {
        checkbox.style.display = 'none';
      }
    },
    contextMenuActions(e, action) {
      switch (action) {
        case 'copy': {
          this.copiedApplication = this.currentGridFieldOnRightClick.cloneNode(true);
          break;
        }
        case 'paste': {
          const currentGridFieldContent = this.currentGridFieldOnRightClick.querySelector('.grid-field-content-wrapper');
          const copiedGridFieldContent = this.copiedApplication.querySelector('.grid-field-content-wrapper');
          if (this.copiedApplication !== null && currentGridFieldContent === null) {
            this.currentGridFieldOnRightClick.innerHTML = '';
            this.currentGridFieldOnRightClick.classList.add('filled');
            this.currentGridFieldOnRightClick.appendChild(copiedGridFieldContent.cloneNode(true));
          }
          break;
        }
        case 'delete': {
          if (this.currentGridFieldOnRightClick.querySelector('.grid-field-content-wrapper')) {
            this.currentGridFieldOnRightClick.classList.remove('filled');
            this.currentGridFieldOnRightClick.innerHTML = '';
          }
        }
      }

      this.contextMenuActive = false;
    },
    dragAndDropEventListenersDesktop(event, type) {
      const gridField = event.currentTarget;

      switch (type) {
        case 'dblclick': {
          if (!gridField.querySelector('.grid-field-content-wrapper')) return;
          this.$emit('applicationName', gridField.querySelector('.applicationName').innerText);
          break;
        }
        case 'dragstart': {
          this.draggedApplication = gridField;
          this.draggedApplicationClone = gridField.cloneNode(true);

          const imgElement = gridField.children[0].querySelector('.applicationImage');
          const imgClone = imgElement.cloneNode();

          imgClone.style.width = '40px';
          imgClone.style.height = '40px';
          imgClone.style.position = 'absolute';
          imgClone.style.top = '-1000px'

          this.$el.appendChild(imgClone);

          event.dataTransfer.setDragImage(imgClone, 20, 20);
          setTimeout(() => {
            this.$el.removeChild(imgClone);
          }, 0)
          break;
        }
        case 'dragover': {
          break;
        }
        case 'drop': {
          if (this.draggedApplicationClone) {
            const checkbox = this.draggedApplicationClone.querySelector('.grid-field-checkbox');
            checkbox.checked = true;
            if (gridField.children.length === 0) {
              gridField.classList.add('filled');
              gridField.appendChild(this.draggedApplicationClone.querySelector('.grid-field-content-wrapper'));
              this.draggedApplication.innerHTML = "";
              this.draggedApplication.classList.remove('filled');
            }
          }
          break;
        }
      }
    },
    getGridFieldByPosition(xPos, yPos) {
      const element = document.elementFromPoint(xPos, yPos);
      if (!element.classList.contains('gridField')) {
        return;
      }

      return element;
    },

    addApplicationToSpecificGridField(application, gridField) {
      gridField.appendChild(application);
      gridField.classList.add('filled');
    },

    addApplicationsToDesktop() {
      let gridFields = this.getAllGridFields();
      let index = 0;

      gridFields.forEach(gridField => {
        if (typeof this.listApplicationElements[index] !== 'undefined') {
          this.addApplicationToSpecificGridField(this.listApplicationElements[index], gridField);
          index++;
        }
      });
    },

    getAllGridFields() {
      return this.$el.querySelectorAll('.gridField');
    },

    applicationImageSrc(appName) {
      try {
        return require(`@/assets/images/footerIcons/${appName}.png`);
      } catch (e) {
        return require(`@/assets/images/footerIcons/default-image.png`);
      }
    },

    checkShouldFillGridField(indexX, indexY) {
      return (
          indexY < this.countApplications &&
          indexX <= Math.floor(this.countApplications / this.GRID_HEIGHT) &&
          typeof this.applicationNames[indexX * this.GRID_HEIGHT + indexY] !== 'undefined'
      )
    }
  },
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
  color: white;
  user-select: none;
}

.grid-field-checkbox {
  position: absolute;
  display: none;
}

.grid-field-img-checkbox-wrapper {
  position: relative;
}

.grid-field-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.gridField.filled:hover {
  background-color: rgba(190, 190, 190, 0.5);
}

.gridField.filled.selected {
  background-color: rgba(190, 190, 190, 0.5);
}

.gridField:focus {
  outline: none;
}

.context-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  background-color: black;
}
</style>