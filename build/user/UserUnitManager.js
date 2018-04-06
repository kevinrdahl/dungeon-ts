"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserUnit_1 = require("./UserUnit");
var UserUnitManager = /** @class */ (function () {
    function UserUnitManager(user) {
        this.units = [];
        this.unitsById = {};
        this.user = user;
    }
    UserUnitManager.prototype.load = function (data) {
        console.log("UnitManager: load");
        for (var _i = 0, _a = data.units; _i < _a.length; _i++) {
            var unitData = _a[_i];
            var unit = new UserUnit_1.default();
            unit.load(unitData);
            this.addUnit(unit);
        }
    };
    UserUnitManager.prototype.addUnit = function (unit) {
        this.units.push(unit);
        this.unitsById[unit.id] = unit;
    };
    UserUnitManager.prototype.removeUnit = function (unit) {
        var index = this.units.indexOf(unit);
        if (index == -1)
            return;
        this.units.splice(index, 1);
        delete this.unitsById[unit.id];
    };
    return UserUnitManager;
}());
exports.default = UserUnitManager;
