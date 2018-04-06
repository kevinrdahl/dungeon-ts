"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hero = (function () {
    function Hero() {
        this.id = -1;
        this.name = "?";
        this.level = 1;
        this.stats = {};
    }
    Hero.prototype.load = function (data) {
        this.id = data.id;
        this.name = data.name;
        this.level = data.level;
        this.stats = data.stats;
    };
    return Hero;
}());
exports.default = Hero;
