<template>
  <div class="calculator-container">
    <section class="calculator">
      <div class="calculator-header">
        <SvgComponent svg-type="moveWindowToTopCorner" custom-width="20" custom-height="20"/>
      </div>
      <div class="calculator-answer">
        <div class="full-sum-preview">{{ calculationList.join(' ') }}</div>
        <div class="display-input-value">{{ inputNumber }}</div>
      </div>
      <div class="calculator-actions">
        <button class="calculator-button" v-for="operator in characterList" :key="operator" @click="onClickOperatorButton(operator)">
          <SvgComponent svg-type="backspace" :custom-width="28" :custom-height="28" v-if="operator === 'back'"></SvgComponent>
          {{ operator !== 'back' ? operator : null }}
        </button>
      </div>
    </section>
    <section class="calculation-history">

    </section>
  </div>
</template>

<script>
import { parseCalculationString } from "@/utils/util"
import SvgComponent from "@/components/ui/svg-component";
export default {
  name: "calculator-window",
  components: {SvgComponent},
  data() {
    return {
      characterList: ['÷', 'CE', 'C', 'back', '1/x', 'x²', '√', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '+/-', '0', '.', '='],
      calculationList: [],
      calculationAnswer: 0,
      inputNumber: '',
      clearInputNumber: false,
      startCalculate: false,
      clearCalculationList: false,
      calculationAfterOperator: false,
      previousOperator: ''
    }
  },
  methods: {
    calculate(operator, afterCalcClearList) {
      this.calculationAnswer = parseCalculationString(this.calculationList);
      this.calculationList.push(operator);
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
      if (!isNaN(Number(operator))) {
        if (this.clearCalculationList) {
          if (this.calculationAfterOperator) {
            this.calculationList = [this.calculationAnswer.toString(), this.previousOperator];
            this.inputNumber = this.calculationAnswer.toString();
          } else {
            this.calculationList = [];
          }
          this.clearCalculationList = false;
        }

        this.handleNumber(operator);
      }

      if (operator === 'back') {
        this.handleBackspace();
      }

      if (operator === '+' || operator === '-' || operator === '×' || operator === '÷') {
        if (this.clearCalculationList) {
          this.calculationList = [];
          this.clearCalculationList = false;
        }

        this.handleOperator(operator);
      }

      if (operator === '=') {
        this.handleEqualSign(operator);
      }

      this.previousOperator = operator;
    },
    handleNumber(number) {
      if (this.clearInputNumber) {
        this.inputNumber = '';
        this.clearInputNumber = false;

        if (this.calculationList.length >= 2) {
          this.startCalculate = true;
        }
      }

      this.inputNumber += number;
    },
    handleOperator(operator) {
      if (this.inputNumber.isEmpty) {
        return;
      }
      if (this.startCalculate) {
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
    }
  }
}
</script>

<style scoped>
  .calculator-container {
    margin: 5px;
  }

  .calculator {
    display: flex;
    flex-direction: column;
    width: 70%;
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
    border-radius: 5px;
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
</style>