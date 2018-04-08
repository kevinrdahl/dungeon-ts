"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile = (function () {
    function Tile() {
        this.pathingType = 0;
        this.walkCost = 1;
        this.flyCost = 1;
        this.name = "Tile";
        this.spriteName = "tile/wall";
        this.x = 0;
        this.y = 0;
    }
    Object.defineProperty(Tile.prototype, "isWalkable", {
        get: function () { return this.pathingType >= 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "isFlyable", {
        get: function () { return this.pathingType >= 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "isPathable", {
        get: function () { return this.isWalkable || this.isFlyable; },
        enumerable: true,
        configurable: true
    });
    //these are all temp!
    //figure out how tiles should actually work!!!
    Tile.prototype.initType = function (type) {
        switch (type) {
            case 1:
                this.initWall();
                break;
            case 2:
                this.initFloor();
                break;
            case 3:
                this.initPit();
                break;
        }
    };
    Tile.prototype.initWall = function () {
        this.pathingType = Tile.PATHING_NONE;
        this.name = "Wall";
        this.spriteName = "tile/wall";
    };
    Tile.prototype.initFloor = function () {
        this.pathingType = Tile.PATHING_WALK;
        this.name = "Floor";
        this.spriteName = "tile/floor";
    };
    Tile.prototype.initPit = function () {
        this.pathingType = Tile.PATHING_FLY;
        this.name = "Pit";
        this.spriteName = "tile/water";
    };
    Tile.PATHING_NONE = 0;
    Tile.PATHING_FLY = 1;
    Tile.PATHING_WALK = 2;
    return Tile;
}());
exports.default = Tile;
