"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SparseGrid_1 = require("../../ds/SparseGrid");
var Globals_1 = require("../../Globals");
var PathingDisplay = (function (_super) {
    __extends(PathingDisplay, _super);
    function PathingDisplay() {
        var _this = _super.call(this) || this;
        _this._alpha = 1;
        _this.padding = 1;
        _this.graphics = new PIXI.Graphics();
        _this.colors = new SparseGrid_1.default();
        _this.dirty = false;
        _this.isClear = true;
        _this.addChild(_this.graphics);
        return _this;
    }
    PathingDisplay.prototype.update = function (timeElapsed) {
        if (this.dirty) {
            this.drawTiles();
        }
    };
    PathingDisplay.prototype.setCoordsToColor = function (coords, color, clear) {
        if (clear === void 0) { clear = true; }
        if (clear)
            this.clear();
        for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
            var c = coords_1[_i];
            this.colors.set(c[0], c[1], color);
        }
        this.dirty = true;
        this.isClear = false;
    };
    PathingDisplay.prototype.setTiles = function (colors, clear) {
        if (clear === void 0) { clear = true; }
        if (clear)
            this.colors = colors;
        else
            this.colors.copyFrom(colors);
        this.dirty = true;
        this.isClear = false;
    };
    PathingDisplay.prototype.setTile = function (x, y, color, clear) {
        if (clear === void 0) { clear = false; }
        if (clear)
            this.clear();
        this.colors.set(x, y, color);
        this.dirty = true;
        this.isClear = false;
    };
    PathingDisplay.prototype.clear = function () {
        if (this.isClear)
            return;
        this.colors = new SparseGrid_1.default();
        this.dirty = true;
        this.isClear = true;
    };
    PathingDisplay.prototype.drawTiles = function () {
        this.graphics.clear();
        var allCoords = this.colors.getAllCoordinates();
        var prevColor = -1;
        var size = Globals_1.default.gridSize;
        for (var _i = 0, allCoords_1 = allCoords; _i < allCoords_1.length; _i++) {
            var coords = allCoords_1[_i];
            var color = this.colors.get(coords[0], coords[1]);
            if (color != prevColor) {
                if (prevColor != -1)
                    this.graphics.endFill();
                //this.graphics.beginFill(color, this._alpha);
                this.graphics.lineStyle(1, color, this._alpha);
                prevColor = color;
            }
            this.graphics.drawRect(coords[0] * size + this.padding, coords[1] * size + this.padding, size - this.padding * 2, size - this.padding * 2);
        }
        //If there are no colors at all, there won't be a fill to end.
        //if (prevColor != -1) this.graphics.endFill();
        this.dirty = false;
    };
    return PathingDisplay;
}(PIXI.Container));
exports.default = PathingDisplay;
