"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function noop() { }
exports.noop = noop;
////////////////////////////////////////
// Objects
////////////////////////////////////////
function shallowCopy(obj) {
    var ret = {};
    var keys = Object.keys(obj);
    var prop;
    for (var i = 0; i < keys.length; i++) {
        prop = keys[i];
        ret[prop] = obj[prop];
    }
    return ret;
}
exports.shallowCopy = shallowCopy;
////////////////////////////////////////
// Arrays
////////////////////////////////////////
function shuffleArray(array) {
    var counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
exports.shuffleArray = shuffleArray;
function pickRandom(array) {
    var len = array.length;
    if (len == 0)
        return null;
    return array[Math.floor(Math.random() * len)];
}
exports.pickRandom = pickRandom;
function pickRandomSet(array, amount) {
    array = array.slice();
    var len = array.length;
    if (len <= amount)
        return array;
    shuffleArray(array);
    return array.slice(0, amount);
}
exports.pickRandomSet = pickRandomSet;
/**
 * Adds value to the array, if it's not already in the array. Returns whether it did anything.
 */
function ArrayAdd(array, value) {
    if (array.indexOf(value) == -1) {
        array.push(value);
        return true;
    }
    return false;
}
exports.ArrayAdd = ArrayAdd;
/**
 * Removes value from array, if it exists. Returns whether it did anything.
 */
function ArrayRemove(array, value) {
    var index = array.indexOf(value);
    if (index != -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}
exports.ArrayRemove = ArrayRemove;
////////////////////////////////////////
// Strings
////////////////////////////////////////
/**
 * Slight misnomer. Removes the first and last characters from a string. Assumes it is long enough to do so.
 */
function stripBraces(s) {
    //might more accurately be called stripFirstAndLastCharacters but that's LONG
    return s.substr(1, s.length - 1);
}
exports.stripBraces = stripBraces;
////////////////////////////////////////
// Numbers
////////////////////////////////////////
function clamp(num, min, max) {
    if (num > max)
        return max;
    if (num < min)
        return min;
    return num;
}
exports.clamp = clamp;
////////////////////////////////////////
// Type Checking
////////////////////////////////////////
function isString(x) {
    return (typeof x === 'string' || x instanceof String);
}
exports.isString = isString;
function isInt(x) {
    return (isNumber(x) && Math.floor(x) == x);
}
exports.isInt = isInt;
function isNumber(x) {
    return (typeof x === 'number');
}
exports.isNumber = isNumber;
/**
 * Returns whether x is an array, and optionally, whether its length is len
 */
function isArray(x, len) {
    if (len === void 0) { len = -1; }
    if (Array.isArray(x)) {
        if (len < 0)
            return true;
        return x.length == len;
    }
    return false;
}
exports.isArray = isArray;
function isObject(x, allowNull) {
    if (allowNull === void 0) { allowNull = false; }
    return (typeof x === 'object' && !isArray(x) && (x != null || allowNull));
}
exports.isObject = isObject;
/**
 * Returns true if x is an array of two numbers.
 */
function isCoordinate(x) {
    return (isArray(x) && x.length == 2 && isNumber(x[0]) && isNumber(x[1]));
}
exports.isCoordinate = isCoordinate;
