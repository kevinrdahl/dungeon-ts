"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile_1 = require("./Tile");
var LevelDisplay_1 = require("./display/LevelDisplay");
var Level = (function () {
    function Level() {
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.display = null;
    }
    Level.prototype.init = function (layout) {
        this.width = layout.width;
        this.height = layout.height;
        var x = 0, y = 0;
        for (var _i = 0, _a = layout.tiles; _i < _a.length; _i++) {
            var tileType = _a[_i];
            var tile = new Tile_1.default();
            tile.x = x;
            tile.y = y;
            tile.initType(tileType);
            this.tiles.push(tile);
            x += 1;
            if (x == this.width) {
                x = 0;
                y += 1;
            }
        }
    };
    Level.prototype.getTile = function (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return null;
        var index = this.width * y + x;
        return this.tiles[index];
    };
    Level.prototype.initDisplay = function () {
        this.display = new LevelDisplay_1.default();
        this.display.initLevel(this);
    };
    return Level;
}());
exports.default = Level;
