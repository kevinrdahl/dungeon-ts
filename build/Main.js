"use strict";
/*
   Code entry point. Keep it clean.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
var startFunc = function () {
    var viewDiv = document.getElementById("viewDiv");
    var game = new Game_1.default(viewDiv);
    game.init();
};
$(document).ready(startFunc);
