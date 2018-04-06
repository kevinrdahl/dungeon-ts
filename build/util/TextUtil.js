"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/pixi.js.d.ts"/>
var Game_1 = require("../Game");
//var mainFont: string = "VT323";
var mainFont = "Arial";
exports.styles = {
    unitID: new PIXI.TextStyle({ fontSize: 14, fontFamily: mainFont, fill: 0xffffff, align: 'left' })
};
/** For scaling without interpolation */
var TextSprite = /** @class */ (function (_super) {
    __extends(TextSprite, _super);
    function TextSprite(text, style) {
        var _this = _super.call(this) || this;
        _this.renderTex = null;
        _this.setText(text, style);
        return _this;
    }
    Object.defineProperty(TextSprite.prototype, "text", {
        get: function () { return this._text; },
        set: function (text) {
            this.setText(text, this._style);
        },
        enumerable: true,
        configurable: true
    });
    TextSprite.prototype.setText = function (text, style) {
        this._text = text;
        this._style = style;
        var oldTex = this.renderTex;
        var pixiText = new PIXI.Text(text, style);
        var bounds = pixiText.getBounds();
        this.renderTex = PIXI.RenderTexture.create(bounds.width, bounds.height);
        Game_1.default.instance.renderer.render(pixiText, this.renderTex);
        this.texture = this.renderTex;
        if (oldTex) {
            oldTex.destroy();
        }
    };
    return TextSprite;
}(PIXI.Sprite));
exports.TextSprite = TextSprite;
