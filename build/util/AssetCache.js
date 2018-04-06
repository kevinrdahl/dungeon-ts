"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssetCache = /** @class */ (function () {
    /**
     * Stores objects by key, and discards the oldest once capacity is reached.
     * TODO: Option to keep the most recently used (move to top when accessed, requires LinkedList)
     *
     * If you use this for PIXI.Texture, be sure to set the onDelete to call destroy.
     */
    function AssetCache(capacity, onDelete) {
        if (onDelete === void 0) { onDelete = null; }
        this._assets = {};
        this._keyQueue = [];
        this.onDelete = null;
        this._capacity = capacity;
        this.onDelete = onDelete;
    }
    Object.defineProperty(AssetCache.prototype, "capacity", {
        get: function () { return this._capacity; },
        set: function (value) { this._capacity = value; this.removeExcess(); },
        enumerable: true,
        configurable: true
    });
    AssetCache.prototype.get = function (key) {
        var asset = this._assets[key];
        if (!asset)
            asset = null;
        return asset;
    };
    AssetCache.prototype.set = function (key, asset) {
        if (this.get(key) === null)
            return;
        this._assets[key] = asset;
        this._keyQueue.push(key);
        this.removeExcess();
    };
    AssetCache.prototype.removeExcess = function () {
        if (this._capacity < 1)
            return;
        var key = this._keyQueue.shift();
        while (this._keyQueue.length > this._capacity) {
            if (this.onDelete)
                this.onDelete(this._assets[key]);
            delete this._assets[key];
        }
    };
    return AssetCache;
}());
exports.default = AssetCache;
