"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Updater = (function () {
    function Updater() {
        this.objects = [];
        this.objectsToAdd = [];
        this.updating = false;
    }
    /**
     * Only to be called by its owner!
     */
    Updater.prototype.update = function (timeElapsed) {
        this.updating = true;
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.update(timeElapsed);
        }
        this.updating = false;
        for (var _b = 0, _c = this.objectsToAdd; _b < _c.length; _b++) {
            var obj = _c[_b];
            this.objects.push(obj);
        }
        this.objectsToAdd.length = 0;
    };
    Updater.prototype.add = function (obj, ifNotAdded) {
        if (ifNotAdded === void 0) { ifNotAdded = false; }
        if (ifNotAdded) {
            if (this.objects.indexOf(obj) !== -1 || this.objectsToAdd.indexOf(obj) !== -1) {
                return;
            }
        }
        if (this.updating) {
            this.objectsToAdd.push(obj);
        }
        else {
            this.objects.push(obj);
        }
    };
    Updater.prototype.remove = function (obj) {
        var index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
        index = this.objectsToAdd.indexOf(obj);
        if (index > -1) {
            this.objectsToAdd.splice(index, 1);
        }
    };
    Updater.prototype.printAll = function () {
        console.log("All updateables:");
        for (var _i = 0, _a = this.objects.concat(this.objectsToAdd); _i < _a.length; _i++) {
            var obj = _a[_i];
            console.log("   " + obj);
        }
    };
    return Updater;
}());
exports.default = Updater;
