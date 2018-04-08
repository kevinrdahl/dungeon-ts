"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Layout = (function () {
    function Layout() {
        this.id = -1;
        this.width = 0;
        this.height = 0;
        this.tiles = [];
    }
    Layout.prototype.readData = function (data) {
        this.id = data.id;
        this.width = data.width;
        this.height = data.height;
        this.parseTiles(data.tiles);
    };
    Layout.prototype.getTileType = function (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return 0;
        var index = this.width * y + x;
        return this.tiles[index];
    };
    Layout.prototype.parseTiles = function (runLength) {
        this.tiles = [];
        for (var i = 0; i < runLength.length; i += 2) {
            var type = runLength[i];
            var num = runLength[i + 1];
            for (var j = 0; j < num; j++) {
                this.tiles.push(type);
            }
        }
    };
    return Layout;
}());
exports.default = Layout;
