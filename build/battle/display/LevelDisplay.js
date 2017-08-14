"use strict";
/// <reference path="../../declarations/pixi.js.d.ts"/>
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
var Globals_1 = require("../../Globals");
var Game_1 = require("../../Game");
var LevelDisplay = (function (_super) {
    __extends(LevelDisplay, _super);
    function LevelDisplay() {
        var _this = _super.call(this) || this;
        _this.level = null;
        _this.tileSprites = [];
        return _this;
    }
    LevelDisplay.prototype.initLevel = function (level) {
        this.level = level;
        this.initTiles();
    };
    //TODO TODO TODO make this not garbage (make a tilemap)
    LevelDisplay.prototype.initTiles = function () {
        for (var _i = 0, _a = this.tileSprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            this.removeChild(sprite);
            sprite.destroy();
        }
        this.tileSprites = [];
        var width = this.level.width;
        var height = this.level.height;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var tile = this.level.getTile(x, y);
                var tex = Game_1.default.instance.textureLoader.get(tile.spriteName);
                var sprite = new PIXI.Sprite(tex);
                this.addChild(sprite);
                this.tileSprites.push(sprite);
                sprite.x = x * Globals_1.default.gridSize;
                sprite.y = y * Globals_1.default.gridSize;
            }
        }
    };
    return LevelDisplay;
}(PIXI.Container));
exports.default = LevelDisplay;
