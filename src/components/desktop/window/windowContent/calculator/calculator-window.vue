<template>
  <div class="calculator-container">
    <section class="calculator">
      <div class="calculator-header">
        <SvgComponent svg-type="moveWindowToTopCorner" :custom-width="20" :custom-height="20"/>
      </div>
      <div class="calculator-answer">
        <div class="full-sum-preview">{{ calculationList.join(' ') }}</div>
        <div class="display-input-value"
             :style="{ 'font-size': isNaN(Number(previousOperator)) && disableButtons === true ? '25px' : '55px'}">
          {{ inputNumber }}
        </div>
      </div>
      <div class="calculator-actions">
        <button class="calculator-button" v-for="operator in characterList" :key="operator"
                :disabled="isNaN(Number(operator)) && disableButtons === true" @click="onClickOperatorButton(operator)">
          <SvgComponent svg-type="backspace" :custom-width="28" :custom-height="28"
                        v-if="operator === 'backspace'"></SvgComponent>
          {{ operator !== 'backspace' ? operator : null }}
        </button>
      </div>
    </section>
    <section class="calculation-history">
      <div class="calculation-history-header">
        <label>History</label>
      </div>
      <div class="history-list-wrapper">
        <div class="history-list-item" v-for="element in calculationHistory" :key="element">
          <div class="history-list-item-content" @click="restorePastCalculation(element)">
            <div class="calculation">{{ element.calculation }}</div>
            <div class="answer" style="color: var(--hover-color)">{{ element.answer }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {parseCalculationString} from "@/utils/util"
import SvgComponent from "@/components/ui/svg-component";

export default {
  name: "calculator-window",
  components: {SvgComponent},
  data() {
    return {
      characterList: ['PI', 'CE', 'C', 'backspace', '1/x', 'x²', '√', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '+/-', '0', '.', '='],
      calculationList: [],
      calculationHistory: [],
      calculationAnswer: 0,
      inputNumber: '',
      clearInputNumber: false,
      startCalculate: false,
      clearCalculationList: false,
      calculationAfterOperator: false,
      disableButtons: false,
      previousOperator: ''
    }
  },
  methods: {
    calculate(operator, afterCalcClearList) {
      if (this.calculationList[1] === '÷' && this.calculationList[2] === '0') {
        this.inputNumber = 'Cannot divide by zero';
        this.disableButtons = true;
        return;
      }
      this.calculationAnswer = parseCalculationString(this.calculationList);
      this.calculationList.push(operator);
      this.calculationHistory.push({'calculation': this.calculationList.join(' '), 'answer': this.calculationAnswer})
      this.inputNumber = this.calculationAnswer.toString();
      this.clearInputNumber = true;
      this.startCalculate = false;

      if (afterCalcClearList) {
        this.clearCalculationList = true;
      }
    },
    onClickOperatorButton(operator) {
      if (this.calculationList.length === 1 && this.calculationList[0] === '0') {
        this.calculationList = [];
      }

      switch (operator) {
        case '.': {
          this.handleDot()
          break;
        }
        case 'CE': {
          this.handleCE();
          break;
        }
        case 'C': {
          this.handleC();
          break;
        }
        case 'PI': {
          this.handlePI();
          break;
        }
        case '+/-': {
          this.handlePositiveNegative();
          break;
        }
        case 'backspace': {
          this.handleBackspace();
          break;
        }
        case '+':
        case '-':
        case '×':
        case '÷': {
          this.handleOperator(operator);
          break;
        }
        case '√':
        case 'x²':
        case '1/x': {
          this.handleSpecialOperator(operator);
          break;
        }
        case '=': {
          this.handleEqualSign(operator);
          break;
        }
        default: {
          if (!isNaN(Number(operator))) {
            this.handleNumber(operator);
          }
        }
      }

      this.previousOperator = operator;
    },
    handleNumber(number) {
      if (this.disableButtons) {
        this.disableButtons = false;
        this.inputNumber = '';
        this.calculationList = [];
        this.clearCalculationList = false;
        this.calculationAfterOperator = false;
        this.startCalculate = false;
      }
      if (this.clearCalculationList) {
        if (this.calculationAfterOperator) {
          this.calculationList = [this.calculationAnswer.toString(), this.previousOperator];
          this.inputNumber = this.calculationAnswer.toString();
        } else {
          this.calculationList = [];
        }
        this.clearCalculationList = false;
      }
      if (this.clearInputNumber) {
        this.inputNumber = '';
        this.clearInputNumber = false;

        if (this.calculationList.length >= 2) {
          this.startCalculate = true;
        }
      }

      this.inputNumber += number;
    },
    handleDot() {
      this.inputNumber += '.';
    },
    handleOperator(operator) {
      if (this.clearCalculationList) {
        this.calculationList = [];
        this.clearCalculationList = false;
      }
      if (this.inputNumber.isEmpty) {
        return;
      }
      if (this.startCalculate) {
        console.log(this.calculationList)
        this.calculationList.push(this.inputNumber);
        this.calculationAfterOperator = true;
        this.calculate('=', true);
        return;
      }
      if (typeof this.calculationList[this.calculationList.length - 1] !== 'undefined') {
        if (isNaN(Number(this.calculationList[this.calculationList.length - 1]))) {
          this.calculationList[this.calculationList.length - 1] = operator;
          return;
        }
      }
      this.calculationList.push(this.inputNumber);
      this.calculationList.push(operator);

      this.clearInputNumber = true;
    },
    handleSpecialOperator(operator) {
      if (this.inputNumber.isEmpty) {
        return;
      }

      this.inputNumber = parseCalculationString([this.inputNumber, operator]);
      console.log(this.inputNumber)
    },
    handleBackspace() {
      if (this.inputNumber.length !== 0) {
        this.inputNumber = this.inputNumber.substring(0, this.inputNumber.length - 1);
      }
    },
    handleEqualSign(equalSign) {
      if (this.previousOperator === '=') {
        return;
      }
      if (this.calculationList.length === 0) {
        this.calculationList.push('0');
        return;
      }

      this.calculationList.push(this.inputNumber);

      this.calculate(equalSign, true);
    },
    handleCE() {
      if (this.inputNumber.isEmpty) {
        return;
      }

      if (this.calculationList.includes('=')) {
        this.calculationList = [];
        this.inputNumber = '';
        return;
      }

      this.inputNumber = '';
    },
    handleC() {
      if (this.inputNumber.isEmpty && this.calculationList.length === 0) {
        return;
      }

      this.calculationList = [];
      this.inputNumber = '';
    },
    handlePI() {
      this.inputNumber = Math.PI;
    },
    handlePositiveNegative() {
      if (this.inputNumber[0] === '-') {
        this.inputNumber = this.inputNumber.substring(1);
      } else {
        this.inputNumber = '-' + this.inputNumber
      }
    },
    restorePastCalculation(element) {
      this.inputNumber = element.answer;
      this.calculationList = [element.calculation];
      this.calculationAfterOperator = true;
    }
  }
}
</script>

<style scoped>
.calculator-container {
  display: flex;
  flex-direction: row;
  margin: 5px;
}

.calculation-history {
  display: flex;
  flex-direction: column;
  width: 20%;
}

.calculation-history-header {
  font-size: 20px;
  padding: 15px;
}

.history-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100%;
  overflow-y: auto;
}

.history-list-item {
  text-align: end;
  font-size: 20px;
  width: 99%;
}

.history-list-item-content {
  padding-right: 10px;
}

.history-list-item-content:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.calculator {
  display: flex;
  flex-direction: column;
  width: 80%;
}

.calculator-answer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px;
}

.calculator-actions {
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: 3px;
}

.calculator-button {
  background-color: var(--hover-color);
  border: none;
  border-radius: 5px;
  height: 150px;
}

.full-sum-preview {
  font-size: 20px;
  height: 20px;
}

.display-input-value {
  font-size: 55px;
  height: 55px;
}

.calculator-button {
  font-size: 40px;
}

@media screen and (min-height: 700px){
  .calculator-button {
    height: 50px;
  }
}
</style>