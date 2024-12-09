<template>
  <div class="grid-container">
    <div v-if="GRID_HEIGHT > 0"
         class="grid"
         @dragover.prevent="dragAndDropEventListenersDesktop($event, 'dragover')"
         @touchover.prevent="dragAndDropEventListenersDesktop($event, 'touchover')"
         @mousemove="mousePositions = {x: $event.clientX, y: $event.clientY}">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="indexX" class="upperGridField">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="indexY" class="gridField"
             :class="{'filled': checkShouldFillGridField(indexX, indexY) }"
             @drop="dragAndDropEventListenersDesktop($event, 'drop')"
             @dragstart="dragAndDropEventListenersDesktop($event, 'dragstart')"
             @mouseover="onMouseOverGridField"
             @mouseleave="onMouseLeaveGridField"
             @touchstart="dragAndDropEventListenersDesktop($event, 'touchstart')"
             @touchover="onMouseOverGridField"
             @touchleave="onMouseLeaveGridField"
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
              <div class="applicationImg">
                <ImgComponent :image-name="applicationNames[indexX * GRID_HEIGHT + indexY]" :custom-width="50" :custom-height="50"/>
              </div>
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
        <div v-if="currentGridFieldOnRightClickContainsApplication" class="context-action">
          <SvgComponent svg-type="copy" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH" @clicked="contextMenuActions($event, 'copy')"/>
        </div>
        <div v-if="currentGridFieldOnRightClickContainsApplication" class="context-action">
          <SvgComponent svg-type="delete" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH" @clicked="contextMenuActions($event, 'delete')"/>
        </div>
        <div class="context-action">
          <SvgComponent svg-type="paste" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH" @clicked="contextMenuActions($event, 'paste')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {compareArrays, parseApplicationNameToImageNameFormat} from "@/utils/util";
import { enableDragDropTouch } from "@/assets/libraries/drag-drop-touch.esm.min";
import json from "@/assets/json/config.json"
import SvgComponent from "@/components/ui/svg-component";
import ImgComponent from "@/components/ui/img-component";

export default {
  name: "application-grid",
  components: {ImgComponent, SvgComponent},
  mounted() {
    this.$nextTick(() => {
      enableDragDropTouch();
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
    },
    windowResizing: {
      type: Boolean,
      required: true
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
    windowResizing(newValue) {
      this.getAllGridFields().forEach(gridField => {
        const contentWrapper = gridField.querySelector('.grid-field-content-wrapper');
        const image = gridField.querySelector('.image');

        if (contentWrapper && image) {
          contentWrapper.draggable = !newValue;
          image.draggable = !newValue;
        }
      });
    }
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
        case 'dragstart':
        case 'touchstart': {
          this.draggedApplication = gridField;
          this.draggedApplicationClone = gridField.cloneNode(true);

          const imgElement = gridField.children[0].querySelector('.applicationImg');
          const imgClone = imgElement.cloneNode(true);

          imgClone.style.width = '50px';
          imgClone.style.height = '50px';
          imgClone.style.position = 'absolute';
          imgClone.style.top = '-1000px'

          this.$el.appendChild(imgClone);

          if (type === 'dragstart') {
            event.dataTransfer.setDragImage(imgClone, 20, 20);
          }
          setTimeout(() => {
            this.$el.removeChild(imgClone);
          }, 0)
          break;
        }
        case 'dragover':
        case 'touchover': {
          event.preventDefault();
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
        return require(`@/assets/images/${parsedAppName}.png`);
      } catch (e) {
        return require(`@/assets/images/default-image.png`);
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
  display: flex;
  align-items: center;
  padding: 5px;
}

.context-action:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.context-action path {
  fill: var(--font-color);
}
</style>