/*
   Code entry point. Keep it clean.
*/

import Game from './Game';

var startFunc = function() {
    var viewDiv = document.getElementById("viewDiv");
    var game: Game = new Game(viewDiv)
    game.init();
}

$(document).ready(startFunc);