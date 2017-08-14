"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2D_1 = require("../util/Vector2D");
var AssetCache_1 = require("../util/AssetCache");
var ResizeInfo = (function () {
    function ResizeInfo(fill, padding) {
        this.fill = fill;
        this.padding = padding;
    }
    ResizeInfo.get = function (fillX, fillY, paddingX, paddingY) {
        var key = JSON.stringify([fillX, fillY, paddingX, paddingY]);
        var info = ResizeInfo.cache.get(key);
        if (!info) {
            info = new ResizeInfo(new Vector2D_1.default(fillX, fillY), new Vector2D_1.default(paddingX, paddingY));
            ResizeInfo.cache.set(key, info);
        }
        return info;
    };
    ResizeInfo.prototype.clone = function () {
        return new ResizeInfo(this.fill.clone(), this.padding.clone());
    };
    //Lots of things will probably end up sharing ResizeInfo, but unlike AttachInfo there aren't natural constants
    ResizeInfo.cache = new AssetCache_1.default(100);
    return ResizeInfo;
}());
exports.default = ResizeInfo;
