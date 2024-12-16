export function deviceIsMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|tablet|ipad|iphone/.test(userAgent)
}

export function compareArrays(arrayOne, arrayTwo) {
    if (arrayOne.length !== arrayTwo.length) {
        return false;
    }
    for (let i = 0; i < arrayOne.length; i++) {
        if (arrayOne[i] !== arrayTwo[i]) {
            return false;
        }
    }

    return true;
}

export function parseApplicationNameToImageNameFormat(name) {
    name = name.replaceAll(' ', '');
    let parsedName = '';
    for (let i = 0; i < name.length; i++) {
        if (name[i + 1] !== undefined && name[i] === name[i].toLowerCase() && name[i + 1] === name[i + 1].toUpperCase()) {
            parsedName += `${name[i]}-`;
        } else if (name[i] === name[i].toUpperCase()) {
            parsedName += name[i].toLowerCase();
        } else {
            parsedName += name[i];
        }
    }

    return parsedName;
}

export function parseCalculationString(calculationArray) {
    console.log(calculationArray)
    for (let i = 0; i < calculationArray.length; i++) {
        if (isNaN(Number(calculationArray[i]))) {
            switch (calculationArray[i]) {
                case '+': {
                    return Number(calculationArray[i - 1]) + Number(calculationArray[i + 1]);
                }
                case '-': {
                    return Number(calculationArray[i - 1]) - Number(calculationArray[i + 1]);
                }
                case '×': {
                    return Number(calculationArray[i - 1]) * Number(calculationArray[i + 1]);
                }
                case '÷': {
                    return Number(calculationArray[i - 1]) / Number(calculationArray[i + 1]);
                }
            }
        }
    }
}