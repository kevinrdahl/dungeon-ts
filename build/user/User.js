"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BattleManager_1 = require("./BattleManager");
var UserUnitManager_1 = require("./UserUnitManager");
var Utils = require("../util/Util");
var User = /** @class */ (function () {
    function User() {
        this.loaded = false;
        this.loadedData = null;
        //managers
        this.unitManager = new UserUnitManager_1.default(this);
        this.battleManager = new BattleManager_1.default(this);
    }
    User.prototype.load = function (data) {
        //probably take this out eventually
        this.loadedData = data;
        console.log("User: load");
        this.userId = data.user.id;
        this.name = data.user.name;
        this.stats = data.user.stats;
        this.token = data.token;
        this.unitManager.load(data);
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
            //choose up to 4 random units
            var units = Utils.pickRandomSet(this.unitManager.units, 4);
            this.battleManager.startBattle(1, 1, units);
        }
    };
    return User;
}());
exports.default = User;
