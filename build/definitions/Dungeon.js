"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dungeon = (function () {
    function Dungeon() {
        this.id = -1;
        this.name = "Some Dungeon";
    }
    Dungeon.prototype.readData = function (data) {
        this.id = data.id;
        this.name = data.name;
    };
    return Dungeon;
}());
exports.default = Dungeon;
