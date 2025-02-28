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
    if (name === null) {
        return;
    }

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

export function parseCalculationString(calculation) {
    for (let i = 0; i < calculation.length; i++) {
        if (isNaN(Number(calculation[i]))) {
            switch (calculation[i]) {
                case '+': {
                    return Number(calculation[i - 1]) + Number(calculation[i + 1]);
                }
                case '-': {
                    return Number(calculation[i - 1]) - Number(calculation[i + 1]);
                }
                case '×': {
                    return Number(calculation[i - 1]) * Number(calculation[i + 1]);
                }
                case '÷': {
                    return Number(calculation[i - 1]) / Number(calculation[i + 1]);
                }
                case '√': {
                    return Math.sqrt(Number(calculation[0]));
                }
                case 'x²': {
                    return Math.pow(Number(calculation[0]), 2);
                }
                case '1/x': {
                    return 1 / Number(calculation[0]);
                }
            }
        }
    }
}

export function parseFileToDbFileObject(name, type, image, file, id, reference) {
    let object = null;
    switch (type) {
        case 'video/mp4':
        case 'Application': {
            if (reference) {
                object = {
                    name: name,
                    type: type,
                    id: id
                }
            } else {
                object = {
                    name: name,
                    type: type,
                    createdAt: new Date(),
                    image: image,
                    file: file
                }
            }
        }
    }

    return object;
}


export function parseToDesktopFileObject(index, name, imageUrl) {
    return {
        'index': index,
        'name': name,
        'imageUrl': imageUrl,
        'overflowing': false,
        'hovering': false
    }
}

export function returnApplicationForFileType(type) {
    let returnValue = null;
    switch (type) {
        case 'video/mp4': {
            returnValue = 'Video Player';
            break;
        }
    }

    return returnValue;
}