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
    for (let i = 0; i < name.length; i++) {
        if (name[i] === ' ') {
            parsedName += '-';
        } else if (name[i + 1] !== undefined && name[i] === name[i].toLowerCase() && name[i + 1] === name[i + 1].toUpperCase()) {
            parsedName += `${name[i]}-`;
        } else if (name[i] === name[i].toUpperCase()) {
            parsedName += name[i].toLowerCase();
        } else {
            parsedName += name[i];
        }
    }

    return parsedName;
}