"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hero_1 = require("./Hero");
var HeroManager = (function () {
    function HeroManager(user) {
        this.heroes = [];
        this.heroesById = {};
        this.user = user;
    }
    HeroManager.prototype.load = function (data) {
        console.log("heroManager: load");
        for (var _i = 0, _a = data.heroes; _i < _a.length; _i++) {
            var heroData = _a[_i];
            var hero = new Hero_1.default();
            hero.load(heroData);
            this.addhero(hero);
        }
    };
    HeroManager.prototype.addhero = function (hero) {
        this.heroes.push(hero);
        this.heroesById[hero.id] = hero;
    };
    HeroManager.prototype.removehero = function (hero) {
        var index = this.heroes.indexOf(hero);
        if (index == -1)
            return;
        this.heroes.splice(index, 1);
        delete this.heroesById[hero.id];
    };
    HeroManager.prototype.getHero = function (id) {
        var hero = this.heroesById[id];
        if (hero)
            return hero;
        return null;
    };
    return HeroManager;
}());
exports.default = HeroManager;
