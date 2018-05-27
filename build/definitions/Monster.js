"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Monster = (function () {
    function Monster() {
        this.id = -1;
        this.name = "Monster";
    }
    Monster.prototype.readData = function (data) {
        this.id = data.id;
        this.name = data.name;
    };
    return Monster;
}());
exports.default = Monster;
