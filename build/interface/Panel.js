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
var Panel = /** @class */ (function (_super) {
    __extends(Panel, _super);
    function Panel(width, height, style) {
        var _this = _super.call(this) || this;
        _this._debugColor = 0x00ff00;
        _this._needRedraw = true;
        _this._className = "Panel";
        _this._width = width;
        _this._height = height;
        _this._style = style;
        _this._texture = null;
        _this.clickable = true;
        _this.draw();
        _this._sprite = new PIXI.Sprite(_this._texture);
        _this._displayObject.addChild(_this._sprite);
        return _this;
    }
    Panel.prototype.resize = function (width, height) {
        if (width != this._width || height != this._height)
            this._needRedraw = true;
        _super.prototype.resize.call(this, width, height);
    };
    Panel.prototype.draw = function () {
        _super.prototype.draw.call(this);
        if (this._needRedraw) {
            this._needRedraw = false;
            var hadTexture = false;
            if (this._texture) {
                hadTexture = true;
                this._texture.resize(this._width, this._height, true);
            }
            //style check!
            switch (this._style) {
                case Panel.HEADER:
                    this._texture = TextureGenerator.simpleRectangle(this._texture, this._width, this._height, 0x616161);
                    break;
                case Panel.FIELD:
                    this._texture = TextureGenerator.simpleRectangle(this._texture, this._width, this._height, 0x121212, 2, 0x616161);
                    break;
                default://BASIC
                    this._texture = TextureGenerator.simpleRectangle(this._texture, this._width, this._height, 0x2b2b2b, 2, 0x616161);
            }
        }
    };
    Panel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._sprite.destroy(true);
    };
    Panel.BASIC = 0;
    Panel.HEADER = 1;
    Panel.FIELD = 2;
    return Panel;
}(InterfaceElement_1.default));
exports.default = Panel;
