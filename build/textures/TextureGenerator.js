"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/pixi.js.d.ts"/>
var Game_1 = require("../Game");
function simpleRectangle(target, width, height, color, borderWidth, borderColor) {
    if (borderWidth === void 0) { borderWidth = 0; }
    if (borderColor === void 0) { borderColor = 0; }
    //if (!target) target = new PIXI.RenderTexture(Game.instance.renderer, width, height);
    if (!target)
        target = PIXI.RenderTexture.create(width, height);
    var g = new PIXI.Graphics(); //Game.instance.volatileGraphics;
    g.lineStyle(borderWidth, borderColor, 1);
    g.beginFill(color, 1);
    g.drawRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
    g.endFill();
    //target.render(g);
    Game_1.default.instance.renderer.render(g, target);
    return target;
}
exports.simpleRectangle = simpleRectangle;
