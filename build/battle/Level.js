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
    Level.prototype.init = function () {
        this.width = 10;
        this.height = 8;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var tile = new Tile_1.default();
                tile.x = x;
                tile.y = y;
                if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
                    tile.initWall();
                }
                else if (this.width - x < 5 && this.height - y < 5) {
                    tile.initPit();
                }
                else {
                    tile.initFloor();
                }
                this.tiles.push(tile);
            }
        }
    };
    Level.prototype.getTile = function (x, y) {
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
