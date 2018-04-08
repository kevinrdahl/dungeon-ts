"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BattleManager_1 = require("./BattleManager");
var HeroManager_1 = require("./HeroManager");
var Utils = require("../util/Util");
var User = (function () {
    function User() {
        this.loaded = false;
        this.loadedData = null;
        //managers
        this.heroManager = new HeroManager_1.default(this);
        this.battleManager = new BattleManager_1.default(this);
    }
    User.prototype.load = function (data) {
        //probably take this out eventually
        this.loadedData = data;
        console.log("User: load");
        this.userId = data.id;
        this.name = data.name;
        this.stats = data.stats;
        this.token = data.token;
        this.heroManager.load(data);
        this.battleManager.load(data);
        //...
        this.loaded = true;
        console.log("User: load done");
    };
    User.prototype.startGame = function () {
        console.log("User: start game");
        if (this.battleManager.checkAnyBattleActive()) {
            console.log("Start from active battle");
            this.battleManager.startActiveBattle();
        }
        else {
            console.log("Start a new battle");
            //choose up to 4 random heroes
            var heroes = Utils.pickRandomSet(this.heroManager.heroes, 4);
            this.battleManager.startBattle(1, 1, heroes);
        }
    };
    return User;
}());
exports.default = User;
