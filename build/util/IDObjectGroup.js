"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDObjectGroup = (function () {
    /**
     * Provides safe convenience methods for efficiently tracking a group of objects.
     * Uses an Object and an Array. The Array is public for iteration but should NOT be modified.
     */
    function IDObjectGroup() {
        this.list = [];
        this._map = {};
    }
    /**
     * Returns whether the object is actually added
     */
    IDObjectGroup.prototype.add = function (obj) {
        if (this._map.hasOwnProperty(obj.id.toString()))
            return false;
        this.list.push(obj);
        this._map[obj.id.toString()] = obj;
        return true;
    };
    /**
     * Returns whether the object is actually removed
     */
    IDObjectGroup.prototype.remove = function (obj) {
        if (!this._map.hasOwnProperty(obj.id.toString()))
            return false;
        var index = this.list.indexOf(obj);
        this.list.splice(index, 1);
        delete this._map[obj.id.toString()];
        return true;
    };
    IDObjectGroup.prototype.getById = function (id) {
        var obj = this._map[id.toString()];
        if (obj)
            return obj;
        return null;
    };
    IDObjectGroup.prototype.contains = function (obj) {
        return this.containsById(obj.id);
    };
    IDObjectGroup.prototype.containsById = function (id) {
        return this._map.hasOwnProperty(id.toString());
    };
    Object.defineProperty(IDObjectGroup.prototype, "count", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    return IDObjectGroup;
}());
exports.default = IDObjectGroup;
