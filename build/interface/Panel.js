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
var InterfaceElement_1 = require("./InterfaceElement");
//import TextureGenerator = require('../textures/TextureGenerator');
var TextureGenerator = require("../textures/TextureGenerator");
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var Panel = (function (_super) {
    __extends(Panel, _super);
    function Panel(width, height, style) {
        var _this = _super.call(this) || this;
        _this._debugColor = 0x00ff00;
        _this._className = "Panel";
        _this._width = width;
        _this._height = height;
        _this._style = style;
        _this.clickable = true;
        var tex = Panel.scaleTextures[style];
        if (!tex) {
            switch (style) {
                case Panel.HEADER:
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x616161);
                    break;
                case Panel.FIELD:
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x121212, 2, 0x616161);
                    break;
                default://BASIC
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x2b2b2b, 2, 0x616161);
            }
            if (tex) {
                Panel.scaleTextures[style] = tex;
            }
        }
        if (tex) {
            _this._sprite = NineSliceSprite_1.default.fromTexture(tex, new PIXI.Rectangle(3, 3, 2, 2));
            _this._displayObject.addChild(_this._sprite);
            _this._sprite.setSize(width, height);
        }
        return _this;
    }
    Panel.prototype.resize = function (width, height) {
        this._sprite.setSize(width, height);
        _super.prototype.resize.call(this, width, height);
    };
    Panel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._sprite.destroy(true);
    };
    Panel.BASIC = 0;
    Panel.HEADER = 1;
    Panel.FIELD = 2;
    Panel.scaleTextures = {};
    return Panel;
}(InterfaceElement_1.default));
exports.default = Panel;
