export function noop() {}

////////////////////////////////////////
// Objects
////////////////////////////////////////
export function shallowCopy(obj:Object):Object {
    var ret = {};
    var keys = Object.keys(obj);
    var prop:string;
    for (var i = 0; i < keys.length; i++) {
        prop = keys[i];
        ret[prop] = obj[prop];
    }

    return ret;
}

////////////////////////////////////////
// Arrays
////////////////////////////////////////
export function shuffleArray(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

export function pickRandom(array) {
    var len = array.length;
    if (len == 0) return null;
    return array[Math.floor(Math.random() * len)];
}

export function pickRandomSet(array, amount) {
    array = array.slice();
    var len = array.length;
    if (len <= amount) return array;
    shuffleArray(array);
    return array.slice(0, amount);
}

////////////////////////////////////////
// Strings
////////////////////////////////////////
/**
 * Slight misnomer. Removes the first and last characters from a string. Assumes it is long enough to do so.
 */
export function stripBraces(s:string):string {
    //might more accurately be called stripFirstAndLastCharacters but that's LONG
    return s.substr(1, s.length-1);
}

////////////////////////////////////////
// Numbers
////////////////////////////////////////
export function clamp(num:number, min:number, max:number):number {
	if (num > max) return max;
	if (num < min) return min;
	return num;
}

////////////////////////////////////////
// Type Checking
////////////////////////////////////////
export function isString(x):boolean {
    return (typeof x === 'string' || x instanceof String);
}

export function isInt(x):boolean {
    return (isNumber(x) && Math.floor(x) == x);
}

export function isNumber(x):boolean {
    return (typeof x === 'number');
}

/**
 * Returns whether x is an array, and optionally, whether its length is len
 */
export function isArray(x, len:number=-1):boolean {
    if (Array.isArray(x)) {
        if (len < 0) return true;
        return x.length == len;
    }
    return false;
}

export function isObject(x, allowNull:boolean=false):boolean {
    return (typeof x === 'object' && !isArray(x) && (x != null || allowNull));
}

/**
 * Returns true if x is an array of two numbers.
 */
export function isCoordinate(x):boolean {
    return (isArray(x) && x.length == 2 && isNumber(x[0]) && isNumber(x[1]));
}