"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Battle_1 = require("../battle/Battle");
var Game_1 = require("../Game");
var RequestManager_1 = require("../RequestManager");
var BattleManager = (function () {
    function BattleManager(user) {
        this.battleData = [];
        this.user = user;
    }
    Object.defineProperty(BattleManager.prototype, "currentBattle", {
        get: function () { return Game_1.default.instance.currentBattle; },
        enumerable: true,
        configurable: true
    });
    BattleManager.prototype.load = function (data) {
        console.log("BattleManager: load");
        for (var _i = 0, _a = data.battles; _i < _a.length; _i++) {
            var data = _a[_i];
            this.battleData.push(data);
        }
    };
    BattleManager.prototype.checkAnyBattleActive = function () {
        for (var _i = 0, _a = this.battleData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.state == BattleManager.STATE_ACTIVE)
                return true;
        }
        return false;
    };
    /**
     * When loading the game, if there is already an active battle, use this to jump into it
     */
    BattleManager.prototype.startActiveBattle = function () {
        for (var _i = 0, _a = this.battleData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.state == BattleManager.STATE_ACTIVE) {
                var battle = new Battle_1.default(true);
                Game_1.default.instance.setCurrentBattle(battle);
                battle.init();
                return;
            }
        }
        console.warn("BattleManager: There was no active battle to start!");
    };
    /**
     *
     * @param dungeonId
     * @param floor
     * @param units The units to be sent
     */
    BattleManager.prototype.startBattle = function (dungeonId, floor, units) {
        var _this = this;
        var unitIds = units.map(function (u) { return u.id; });
        RequestManager_1.default.instance.makeUserRequest("start_battle", {
            "dungeon_id": dungeonId,
            "floor": floor,
            "unit_ids": unitIds
        }, function (data) { _this.onStartBattle(data); });
    };
    BattleManager.prototype.onStartBattle = function (data) {
        var battle = new Battle_1.default(true);
        Game_1.default.instance.setCurrentBattle(battle);
        battle.init();
    };
    //I'm not actually sure yet what all of these are supposed to mean
    BattleManager.STATE_AVAILABLE = 0;
    BattleManager.STATE_ACTIVE = 1;
    BattleManager.STATE_WON = 2;
    BattleManager.STATE_LOST = 3;
    BattleManager.STATE_ABANDONED = 4;
    return BattleManager;
}());
exports.default = BattleManager;
