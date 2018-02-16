"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var Player = (function () {
    function Player() {
        this.battle = null;
        this.units = new IDObjectGroup_1.default();
        this._id = Player._nextID++;
    }
    Object.defineProperty(Player.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Player.prototype.addUnit = function (unit) {
        if (unit.player) {
            unit.player.removeUnit(unit);
        }
        var added = this.units.add(unit);
        if (added) {
            unit.player = this;
        }
    };
    Player.prototype.removeUnit = function (unit) {
        var removed = this.units.remove(unit);
        if (unit.player == this) {
            unit.player = null;
        }
    };
    Player.prototype.checkDefeated = function () {
        for (var _i = 0, _a = this.units.list; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.alive)
                return false;
        }
        return true;
    };
    Player._nextID = 1;
    return Player;
}());
exports.default = Player;
