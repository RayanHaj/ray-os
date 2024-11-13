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
    let parsedName = '';
    for (let letter of name) {
        if (letter === ' ') {
            parsedName += '-';
        } else if (letter === letter.toUpperCase()) {
            parsedName += letter.toLowerCase();
        } else {
            parsedName += letter;
        }
    }

    return parsedName;
}