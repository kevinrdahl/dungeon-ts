"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = (function () {
    function User() {
        this.loaded = false;
        this.loadedData = null;
    }
    User.prototype.load = function (data) {
        //probably take this out eventually
        this.loadedData = data;
        console.log("User: load");
        //...
        this.loaded = true;
    };
    User.prototype.startGame = function () {
        console.log("User: start game");
    };
    return User;
}());
exports.default = User;
