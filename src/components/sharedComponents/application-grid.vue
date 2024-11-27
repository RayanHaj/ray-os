<template>
  <div class="grid-container">
    <div v-if="GRID_HEIGHT > 0"
         class="grid"
         @dragover.prevent="dragAndDropEventListenersDesktop($event, 'dragover')"
         @mousemove="mousePositions = {x: $event.clientX, y: $event.clientY}">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="indexX" class="upperGridField">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="indexY" class="gridField"
             :class="{'filled': checkShouldFillGridField(indexX, indexY) }"
             @drop="dragAndDropEventListenersDesktop($event, 'drop')"
             @dragstart="dragAndDropEventListenersDesktop($event, 'dragstart')"
             @mouseover="onMouseOverGridField"
             @mouseleave="onMouseLeaveGridField"
             @dblclick="onDoubleClick($event)"
             @click="onClickGridField($event)"
             @keydown.prevent="onKeydownGridField($event)"
             @contextmenu.prevent="onRightClickGridField"
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
                  :src="applicationImageSrc(applicationNames[indexX * GRID_HEIGHT + indexY])"
                  alt="applicationImage"
                  draggable="false"
                  :style="{
                    width: `${IMAGE_WIDTH}px`,
                    height: `${IMAGE_HEIGHT}px`
                  }"
              />
            </div>
            <div class="applicationName" :style="{fontSize: `${GRID_FIELD_TEXT_FONT_SIZE}px`}">
              {{ applicationNames[indexX * GRID_HEIGHT + indexY] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="contextMenuActive === true" class="context-menu" ref="contextMenu">
      <div class="context-actions-wrapper">
        <svg class="context-action" v-if="currentGridFieldOnRightClickContainsApplication"
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" :width="CONTEXT_MENU_SVG_WIDTH"
             :height="CONTEXT_MENU_SVG_HEIGHT"
             @click="contextMenuActions($event, 'copy')">
          <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
              d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"/>
        </svg>
        <svg class="context-action" v-if="currentGridFieldOnRightClickContainsApplication"
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" :width="CONTEXT_MENU_SVG_WIDTH"
             :height="CONTEXT_MENU_SVG_HEIGHT"
             @click="contextMenuActions($event, 'delete')">
          <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
              d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
        </svg>
        <svg class="context-action" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
             :width="CONTEXT_MENU_SVG_WIDTH"
             :height="CONTEXT_MENU_SVG_HEIGHT"
             @click="contextMenuActions($event, 'paste')">
          <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
              d="M160 0c-23.7 0-44.4 12.9-55.4 32L48 32C21.5 32 0 53.5 0 80L0 400c0 26.5 21.5 48 48 48l144 0 0-272c0-44.2 35.8-80 80-80l48 0 0-16c0-26.5-21.5-48-48-48l-56.6 0C204.4 12.9 183.7 0 160 0zM272 128c-26.5 0-48 21.5-48 48l0 272 0 16c0 26.5 21.5 48 48 48l192 0c26.5 0 48-21.5 48-48l0-220.1c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1L320 128l-48 0zM160 40a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import {compareArrays, parseApplicationNameToImageNameFormat} from "@/utils/util";
import json from "@/assets/json/config.json"

export default {
  name: "application-grid",

  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },

  data() {
    return {
      GRID_WIDTH: 0,
      GRID_HEIGHT: 0,
      IMAGE_WIDTH: 40,
      IMAGE_HEIGHT: 40,
      GRID_FIELD_WIDTH: 82,
      GRID_FIELD_HEIGHT: 82,
      GRID_FIELD_TEXT_FONT_SIZE: 10,
      CONTEXT_MENU_SVG_WIDTH: 20,
      CONTEXT_MENU_SVG_HEIGHT: 20,
      contextMenuActive: false,
      draggedApplication: null,
      draggedApplicationClone: null,
      currentGridFieldOnRightClick: null,
      currentGridFieldOnRightClickContainsApplication: false,
      copiedApplication: null,
      countApplications: 0,
      listApplicationElements: [],
      copiedApplications: [],
      applicationNames: json.applicationNames,
      mousePositions: {x: 0, y: 0},
    }
  },

  props: {
    windowSize: {
      type: Array,
      required: false
    }
  },

  watch: {
    windowSize(newSize, oldSize) {
      if (compareArrays(oldSize, newSize) === false) {
        this.init();

        let gridFields = this.getAllGridFields();
        gridFields.forEach(gridField => {
          if (gridField.children.length !== 0) {
            gridField.removeChild(gridField.children[0]);

            if (gridField.classList.contains('filled')) {
              gridField.classList.remove('filled');
            }
          }
        });
        this.addApplicationsToGrid();
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

          if (listApplicationElementsTempArray.some(element => element.indexOfApplicationName === indexOfApplicationName)) {
            return;
          }

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
      this.checkOrUncheckGivenCheckbox(gridField);
    },
    checkOrUncheckGivenCheckbox(gridField) {
      const checkbox = gridField.querySelector('.grid-field-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.checked === true ? gridField.classList.add('selected') : gridField.classList.remove('selected');
        this.unCheckAllCheckBoxesExceptGivenCheckbox(checkbox);
      }

      this.contextMenuActive === true ? this.contextMenuActive = false : null;
    },
    unCheckAllCheckBoxesExceptGivenCheckbox(checkbox) {
      this.getAllGridFields().forEach(gridField => {
        const gridFieldCheckbox = gridField.querySelector('.grid-field-checkbox');
        if (gridFieldCheckbox && gridFieldCheckbox.checked === true && gridFieldCheckbox !== checkbox) {
          gridFieldCheckbox.checked = false;
          gridField.classList.remove('selected');
        }
      });
    },
    onKeydownGridField(event) {
      if (event.key === 'Delete') {
        let selectedGridField = this.getSelectedGridField();
        if (selectedGridField) {
          selectedGridField.classList.remove('filled');
          selectedGridField.innerHTML = '';
        }
      }
      if (event.ctrlKey && event.code === 'KeyC') {
        this.copiedApplication = this.getSelectedGridField();
      }
      if (event.ctrlKey && event.code === 'KeyV') {
        const gridFieldAtMousePosition = this.getGridFieldByPosition(this.mousePositions.x, this.mousePositions.y);
        if (!gridFieldAtMousePosition || gridFieldAtMousePosition.classList.contains('filled')) {
          return;
        }

        const parentClone = this.copiedApplication.cloneNode(true);
        parentClone.classList.remove('selected')

        const childClone = parentClone.children[0];
        childClone.querySelector('.grid-field-checkbox').checked = false;
        this.addApplicationToSpecificGridField(childClone, gridFieldAtMousePosition);
      }
    },
    getSelectedGridField() {
      const gridFields = this.getAllGridFields();

      let returnValue = null;
      gridFields.forEach(gridField => {
        const checkbox = gridField.querySelector('.grid-field-checkbox');
        if (checkbox && checkbox.checked === true) {
          returnValue = gridField;
        }
      });

      return returnValue;
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
    onDoubleClick(event) {
      const gridField = event.currentTarget;
      if (!gridField.querySelector('.grid-field-content-wrapper')) return;
      this.$emit('applicationName', gridField.querySelector('.applicationName').innerText);
    },
    contextMenuActions(e, action) {
      switch (action) {
        case 'copy': {
          this.copiedApplication = this.currentGridFieldOnRightClick.cloneNode(true);
          break;
        }
        case 'paste': {
          if (this.copiedApplication === null || this.currentGridFieldOnRightClick === null) {
            return;
          }
          const currentGridFieldContent = this.currentGridFieldOnRightClick.querySelector('.grid-field-content-wrapper');
          const copiedGridFieldContent = this.copiedApplication.querySelector('.grid-field-content-wrapper');
          if (copiedGridFieldContent !== null && currentGridFieldContent === null) {
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

    addApplicationsToGrid() {
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
      const parsedAppName = parseApplicationNameToImageNameFormat(appName);
      try {
        return require(`@/assets/images/footerIcons/${parsedAppName}.png`);
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
  background-color: var(--background-color-window);
  width: 120px;
  height: 100px;
  padding: 3px;
}

.context-actions-wrapper {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.context-action {
  padding: 10px;
}

.context-action:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.context-action path {
  fill: var(--font-color);
}
</style>