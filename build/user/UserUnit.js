"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserUnit = /** @class */ (function () {
    function UserUnit() {
        this.id = -1;
        this.name = "?";
        this.level = 1;
        this.stats = {};
    }
    UserUnit.prototype.load = function (data) {
        this.id = data.id;
        this.name = data.name;
        this.level = data.level;
        this.stats = data.stats;
    };
    return UserUnit;
}());
exports.default = UserUnit;
